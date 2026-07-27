import type { ChatModelAdapter, ThreadMessage } from '@assistant-ui/react';
import type { ChatSocketService } from './ChatSocket.service';

const getText = (message: ThreadMessage): string =>
  message.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();

export const createWebSocketChatAdapter = (
  chatSocketService: ChatSocketService,
  conversationId: string,
): ChatModelAdapter => ({
  async *run({ messages, abortSignal }) {
    const userMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'user');

    if (!userMessage) {
      yield {
        content: [{ type: 'text', text: 'No user message was provided.' }],
        status: { type: 'incomplete', reason: 'error' },
      };
      return;
    }

    let response = '';

    try {
      for await (const delta of chatSocketService.stream(
        {
          requestId: crypto.randomUUID(),
          conversationId,
          message: getText(userMessage),
        },
        abortSignal,
      )) {
        response += delta;
        yield {
          content: [{ type: 'text', text: response }],
          status: { type: 'running' },
        };
      }

      if (!abortSignal.aborted) {
        yield {
          content: [{ type: 'text', text: response }],
          status: { type: 'complete', reason: 'stop' },
        };
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'The chat request failed.';
      yield {
        content: [
          {
            type: 'text',
            text: `I couldn't reach the chat service. ${message}`,
          },
        ],
        status: {
          type: 'incomplete',
          reason: 'error',
          error: { message },
        },
      };
    }
  },
});
