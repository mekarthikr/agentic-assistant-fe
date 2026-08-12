import type {
  ChatConnectionStatus,
  ChatRequest,
  ChatServerMessage,
  ChatSource,
  ChatStreamEvent,
  ModelTokenUsage,
  PendingChatRequest,
} from '@app/types';

const CONNECTION_TIMEOUT_MS = 8_000;
const MAX_RECONNECT_DELAY_MS = 10_000;
const HEARTBEAT_INTERVAL_MS = 20_000;
const PONG_TIMEOUT_MS = 10_000;
const DEFAULT_WEBSOCKET_URL = 'wss://agentic-assistant-be.vercel.app/ws';

const getTokenCount = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;

const normalizeTokenUsage = (value: unknown): ModelTokenUsage | null => {
  if (!value || typeof value !== 'object') return null;

  const usage = value as Record<string, unknown>;
  const totalTokens = getTokenCount(usage.totalTokens);
  if (totalTokens === undefined) return null;

  const inputTokens = getTokenCount(usage.inputTokens);
  const outputTokens = getTokenCount(usage.outputTokens);
  const contextWindow = getTokenCount(usage.contextWindow);
  const contextTokensUsed =
    getTokenCount(usage.contextTokensUsed) ?? inputTokens;
  const contextTokensRemaining =
    getTokenCount(usage.contextTokensRemaining) ??
    (contextWindow !== undefined && contextTokensUsed !== undefined
      ? Math.max(contextWindow - contextTokensUsed, 0)
      : undefined);
  const rawRateLimitRemainingTokens =
    usage.rateLimitRemainingTokens ?? usage.remainingTokens;
  const rateLimitRemainingTokens =
    rawRateLimitRemainingTokens === null
      ? null
      : getTokenCount(rawRateLimitRemainingTokens);

  return {
    totalTokens,
    ...(typeof usage.model === 'string' ? { model: usage.model } : {}),
    ...(contextWindow === undefined ? {} : { contextWindow }),
    ...(inputTokens === undefined ? {} : { inputTokens }),
    ...(outputTokens === undefined ? {} : { outputTokens }),
    ...(contextTokensUsed === undefined ? {} : { contextTokensUsed }),
    ...(contextTokensRemaining === undefined ? {} : { contextTokensRemaining }),
    ...(rateLimitRemainingTokens === undefined
      ? {}
      : { rateLimitRemainingTokens }),
  };
};

const normalizeSources = (value: unknown): ChatSource[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const source = item as Record<string, unknown>;
    if (
      typeof source.id !== 'string' ||
      typeof source.title !== 'string' ||
      typeof source.filename !== 'string' ||
      typeof source.mediaType !== 'string'
    ) {
      return [];
    }

    const page = getTokenCount(source.page);
    return [
      {
        id: source.id,
        title: source.title,
        filename: source.filename,
        mediaType: source.mediaType,
        ...(page === undefined ? {} : { page }),
      },
    ];
  });
};

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

  public getStatus = (): ChatConnectionStatus => this.status;
  public getTokenUsage = (): ModelTokenUsage | null => this.tokenUsage;
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
          this.setTokenUsage(normalizeTokenUsage(payload.tokenUsage));
          request.sources = normalizeSources(payload.sources);
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
  ): AsyncGenerator<ChatStreamEvent> {
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
          yield { type: 'delta', delta: pendingRequest.deltas.shift()! };
        }
      }

      if (pendingRequest.error) throw pendingRequest.error;
      yield { type: 'complete', sources: pendingRequest.sources ?? [] };
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
