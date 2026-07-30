import type {
  AuthenticatedChatSession,
  ChatConnectionStatus,
  ChatRequest,
  ChatServerMessage,
  ModelTokenUsage,
  PendingChatRequest,
} from '@app/types';

const CONNECTION_TIMEOUT_MS = 8_000;
const MAX_RECONNECT_DELAY_MS = 10_000;
const HEARTBEAT_INTERVAL_MS = 20_000;
const PONG_TIMEOUT_MS = 10_000;
const DEFAULT_WEBSOCKET_URL = 'wss://agentic-assistant-be.vercel.app/ws';

const getWebSocketUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (configuredUrl) return configuredUrl;

  return DEFAULT_WEBSOCKET_URL;
};

export class ChatSocketService {
  private socket: WebSocket | null = null;
  private connectPromise: Promise<void> | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: number | undefined;
  private heartbeatTimer: number | undefined;
  private pongTimer: number | undefined;
  private manuallyClosed = false;
  private readonly pending = new Map<string, PendingChatRequest>();
  private readonly statusListeners = new Set<
    (status: ChatConnectionStatus) => void
  >();
  private status: ChatConnectionStatus = 'disconnected';
  private conversationId = crypto.randomUUID();
  private tokenUsage: ModelTokenUsage | null = null;
  private readonly tokenUsageListeners = new Set<() => void>();
  private session: AuthenticatedChatSession | null = null;
  private readonly sessionListeners = new Set<() => void>();

  public getStatus = (): ChatConnectionStatus => this.status;
  public getTokenUsage = (): ModelTokenUsage | null => this.tokenUsage;
  public getSession = (): AuthenticatedChatSession | null => this.session;
  public getConversationId = (): string => this.conversationId;

  public subscribe = (
    listener: (status: ChatConnectionStatus) => void,
  ): (() => void) => {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  };

  public subscribeTokenUsage = (listener: () => void): (() => void) => {
    this.tokenUsageListeners.add(listener);
    return () => this.tokenUsageListeners.delete(listener);
  };

  public subscribeSession = (listener: () => void): (() => void) => {
    this.sessionListeners.add(listener);
    return () => this.sessionListeners.delete(listener);
  };

  public resetConversation = (): void => {
    this.conversationId = crypto.randomUUID();
    this.setTokenUsage(null);
  };

  private setStatus(status: ChatConnectionStatus): void {
    this.status = status;
    for (const listener of this.statusListeners) listener(status);
  }

  private setTokenUsage(tokenUsage: ModelTokenUsage | null): void {
    this.tokenUsage = tokenUsage;
    for (const listener of this.tokenUsageListeners) listener();
  }

  private setSession(session: AuthenticatedChatSession | null): void {
    this.session = session;
    for (const listener of this.sessionListeners) listener();
  }

  public async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.connectPromise) return this.connectPromise;

    this.manuallyClosed = false;
    this.setStatus('connecting');

    const connection = new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(getWebSocketUrl());
      this.socket = socket;
      let connectionReady = false;

      const timeout = window.setTimeout(() => {
        socket.close(1000, 'Connection timed out');
        reject(new Error('The chat server did not respond in time.'));
      }, CONNECTION_TIMEOUT_MS);

      socket.addEventListener('open', () => {
        const token = import.meta.env.VITE_WS_AUTH_TOKEN as string | undefined;
        if (token) {
          socket.send(JSON.stringify({ type: 'auth', token }));
        }
      });

      socket.addEventListener('message', (event) => {
        const payload = this.parseServerMessage(event.data);
        if (!payload) return;

        if (payload.type === 'connection.ready') {
          if (
            !payload.session ||
            (payload.session.role !== 'AGENT' &&
              payload.session.role !== 'CLIENT') ||
            typeof payload.session.displayName !== 'string'
          ) {
            socket.close(1008, 'Session context is unavailable');
            reject(new Error('Your authenticated session is unavailable.'));
            return;
          }

          this.setSession(payload.session);
          connectionReady = true;
          window.clearTimeout(timeout);
          this.reconnectAttempt = 0;
          this.setStatus('connected');
          this.startHeartbeat(socket);
          resolve();
          return;
        }

        if (payload.type === 'pong') {
          window.clearTimeout(this.pongTimer);
          return;
        }

        const request = payload.requestId
          ? this.pending.get(payload.requestId)
          : undefined;
        if (!request) return;

        if (
          payload.type === 'chat.delta' &&
          typeof payload.delta === 'string'
        ) {
          request.deltas.push(payload.delta);
          request.wake?.();
        } else if (payload.type === 'chat.complete') {
          if (payload.tokenUsage) this.setTokenUsage(payload.tokenUsage);
          request.done = true;
          request.wake?.();
        } else if (payload.type === 'chat.error') {
          request.error = new Error(
            payload.message || 'The chat request failed.',
          );
          request.done = true;
          request.wake?.();
        }
      });

      socket.addEventListener('error', () => {
        this.setStatus('error');
        if (!connectionReady) {
          window.clearTimeout(timeout);
          reject(new Error('Unable to connect to the chat server.'));
        }
      });

      socket.addEventListener('close', () => {
        window.clearTimeout(timeout);
        const isCurrentSocket = this.socket === socket;
        if (isCurrentSocket) {
          this.stopHeartbeat();
          this.socket = null;
          this.failPendingRequests(
            new Error('The chat connection was interrupted.'),
          );
        }

        if (!connectionReady) {
          reject(new Error('Unable to connect to the chat server.'));
        }

        if (isCurrentSocket && !this.manuallyClosed) {
          this.setStatus('disconnected');
          this.scheduleReconnect();
        }
      });
    });

    const trackedConnection = connection.finally(() => {
      if (this.connectPromise === trackedConnection) {
        this.connectPromise = null;
      }
    });
    this.connectPromise = trackedConnection;
    return trackedConnection;
  }

  public async *stream(
    request: ChatRequest,
    signal: AbortSignal,
  ): AsyncGenerator<string> {
    await this.connect();

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('The chat server is not connected.');
    }

    const pendingRequest: PendingChatRequest = { deltas: [], done: false };
    this.pending.set(request.requestId, pendingRequest);

    const cancel = () => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            type: 'chat.cancel',
            requestId: request.requestId,
          }),
        );
      }
      pendingRequest.done = true;
      pendingRequest.wake?.();
    };
    signal.addEventListener('abort', cancel, { once: true });

    this.socket.send(JSON.stringify({ type: 'chat.send', ...request }));

    try {
      while (!pendingRequest.done || pendingRequest.deltas.length > 0) {
        if (pendingRequest.deltas.length === 0) {
          await new Promise<void>((resolve) => {
            pendingRequest.wake = resolve;
          });
          pendingRequest.wake = undefined;
        }

        while (pendingRequest.deltas.length > 0) {
          yield pendingRequest.deltas.shift()!;
        }
      }

      if (pendingRequest.error) throw pendingRequest.error;
    } finally {
      signal.removeEventListener('abort', cancel);
      this.pending.delete(request.requestId);
    }
  }

  public close(): void {
    this.manuallyClosed = true;
    window.clearTimeout(this.reconnectTimer);
    this.stopHeartbeat();
    this.socket?.close(1000, 'Client closed');
    this.socket = null;
    this.connectPromise = null;
    this.setSession(null);
    this.setStatus('disconnected');
  }

  private parseServerMessage(data: unknown): ChatServerMessage | null {
    if (typeof data !== 'string') return null;

    try {
      return JSON.parse(data) as ChatServerMessage;
    } catch {
      return null;
    }
  }

  private failPendingRequests(error: Error): void {
    for (const pendingRequest of this.pending.values()) {
      pendingRequest.error = error;
      pendingRequest.done = true;
      pendingRequest.wake?.();
    }
  }

  private startHeartbeat(socket: WebSocket): void {
    this.stopHeartbeat();

    const ping = () => {
      if (this.socket !== socket || socket.readyState !== WebSocket.OPEN)
        return;

      socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      window.clearTimeout(this.pongTimer);
      this.pongTimer = window.setTimeout(() => {
        if (this.socket === socket) {
          socket.close(4000, 'Heartbeat timed out');
        }
      }, PONG_TIMEOUT_MS);
    };

    ping();
    this.heartbeatTimer = window.setInterval(ping, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    window.clearInterval(this.heartbeatTimer);
    window.clearTimeout(this.pongTimer);
    this.heartbeatTimer = undefined;
    this.pongTimer = undefined;
  }

  private scheduleReconnect(): void {
    window.clearTimeout(this.reconnectTimer);
    const delay = Math.min(
      500 * 2 ** this.reconnectAttempt,
      MAX_RECONNECT_DELAY_MS,
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = window.setTimeout(() => {
      void this.connect().catch(() => undefined);
    }, delay);
  }
}
