import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { ChatSocketService, createWebSocketChatAdapter } from '@app/service';
import type {
  ChatControlContextValue,
  ChatRuntimeProviderProps,
} from '@app/types';
import { ChatControlContext } from './ChatControlContext';

export const ChatRuntimeProvider = ({ children }: ChatRuntimeProviderProps) => {
  const [chatSocketService] = useState(() => new ChatSocketService());
  const [conversationId] = useState(() => crypto.randomUUID());
  const adapter = useMemo(
    () => createWebSocketChatAdapter(chatSocketService, conversationId),
    [chatSocketService, conversationId],
  );
  const runtime = useLocalRuntime(adapter);
  const connectionStatus = useSyncExternalStore(
    chatSocketService.subscribe,
    chatSocketService.getStatus,
    chatSocketService.getStatus,
  );

  useEffect(() => {
    void chatSocketService.connect().catch(() => undefined);
    return () => chatSocketService.close();
  }, [chatSocketService]);

  const controls = useMemo<ChatControlContextValue>(
    () => ({
      connectionStatus,
      reconnect: () => chatSocketService.connect(),
      runtime,
    }),
    [chatSocketService, connectionStatus, runtime],
  );

  return (
    <ChatControlContext.Provider value={controls}>
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    </ChatControlContext.Provider>
  );
};
