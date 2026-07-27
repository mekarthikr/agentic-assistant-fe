import type { ChatModelAdapter, ThreadMessage } from '@assistant-ui/react';
import type { ChatHistoryMessage } from '@app/types';
import type { ChatApiService } from './ChatApi.service';

const getText = (message: ThreadMessage): string =>
  message.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();

const toChatHistory = (messages: readonly ThreadMessage[]): ChatHistoryMessage[] =>
  messages
    .map((message) => ({
      role: message.role,
      content: getText(message),
    }))
    .filter(
      (message): message is ChatHistoryMessage =>
        (message.role === 'user' ||
          message.role === 'assistant' ||
          message.role === 'system') &&
        Boolean(message.content),
    )
    .slice(-50);

export const createChatAdapter = (
  chatApiService: ChatApiService,
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
      for await (const delta of chatApiService.stream(
        toChatHistory(messages),
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
