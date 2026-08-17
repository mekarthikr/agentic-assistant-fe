import type { ChatModelAdapter, ThreadMessage } from '@assistant-ui/react';
import type { ChatSource, UserType } from '@app/types';
import type { ChatSocketService } from './ChatSocket.service';
import { documentService } from './Document.service';

const SHOW_RAG_SOURCES = import.meta.env.VITE_SHOW_RAG_SOURCES === 'true';

const getText = (message: ThreadMessage): string =>
  message.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();

const toSourcePart = (source: ChatSource) => ({
  type: 'source' as const,
  sourceType: 'document' as const,
  id: source.id,
  title:
    source.page === undefined
      ? source.title
      : `${source.title} · Page ${source.page}`,
  filename: source.filename,
  mediaType: source.mediaType,
});

export const createWebSocketChatAdapter = (
  chatSocketService: ChatSocketService,
  userType: UserType,
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
    let sources: ChatSource[] = [];

    try {
      for await (const event of chatSocketService.stream(
        {
          requestId: crypto.randomUUID(),
          conversationId: chatSocketService.getConversationId(),
          message: getText(userMessage),
          userType,
          ...documentService.getChatScope(),
        },
        abortSignal,
      )) {
        if (event.type === 'complete') {
          sources = event.sources;
        } else {
          response += event.delta;
          yield {
            content: [{ type: 'text', text: response }],
            status: { type: 'running' },
          };
        }
      }

      if (!abortSignal.aborted) {
        yield {
          content: [
            { type: 'text', text: response },
            ...(SHOW_RAG_SOURCES ? sources.map(toSourcePart) : []),
          ],
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
