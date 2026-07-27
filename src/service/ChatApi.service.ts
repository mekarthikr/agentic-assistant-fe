import type { ChatConnectionStatus, ChatHistoryMessage } from '@app/types';

const getApiUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  return (configuredUrl || 'http://localhost:5000').replace(/\/+$/, '');
};

export class ChatApiService {
  private readonly statusListeners = new Set<
    (status: ChatConnectionStatus) => void
  >();
  private status: ChatConnectionStatus = 'disconnected';

  public getStatus = (): ChatConnectionStatus => this.status;

  public subscribe = (
    listener: (status: ChatConnectionStatus) => void,
  ): (() => void) => {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  };

  public async connect(): Promise<void> {
    this.setStatus('connecting');

    try {
      const response = await fetch(`${getApiUrl()}/health`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('The chat service is unavailable.');
      this.setStatus('connected');
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  public async *stream(
    messages: ChatHistoryMessage[],
    signal: AbortSignal,
  ): AsyncGenerator<string> {
    try {
      const response = await fetch(`${getApiUrl()}/chat`, {
        method: 'POST',
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
        signal,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(body?.message || 'The chat request failed.');
      }
      if (!response.body) {
        throw new Error('The chat service returned an empty response.');
      }

      this.setStatus('connected');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const delta = decoder.decode(value, { stream: true });
        if (delta) yield delta;
      }

      const finalDelta = decoder.decode();
      if (finalDelta) yield finalDelta;
    } catch (error) {
      if (!signal.aborted) this.setStatus('error');
      throw error;
    }
  }

  public close(): void {
    this.setStatus('disconnected');
  }

  private setStatus(status: ChatConnectionStatus): void {
    this.status = status;
    for (const listener of this.statusListeners) listener(status);
  }
}
