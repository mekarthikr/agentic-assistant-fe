import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { ChatSocketService, createWebSocketChatAdapter } from '@app/service';
import type {
  ChatControlContextValue,
  ChatRuntimeProviderProps,
} from '@app/types';
import { ChatControlContext } from './ChatControlContext';

export const ChatRuntimeProvider = ({
  children,
  userType,
}: ChatRuntimeProviderProps) => {
  const [chatSocketService] = useState(() => new ChatSocketService());
  const adapter = useMemo(
    () => createWebSocketChatAdapter(chatSocketService, userType),
    [chatSocketService, userType],
  );
  const runtime = useLocalRuntime(adapter);
  const connectionStatus = useSyncExternalStore(
    chatSocketService.subscribe,
    chatSocketService.getStatus,
    chatSocketService.getStatus,
  );
  const tokenUsage = useSyncExternalStore(
    chatSocketService.subscribeTokenUsage,
    chatSocketService.getTokenUsage,
    chatSocketService.getTokenUsage,
  );
  useEffect(() => {
    void chatSocketService.connect().catch(() => undefined);
    return () => chatSocketService.close();
  }, [chatSocketService]);

  const controls = useMemo<ChatControlContextValue>(
    () => ({
      connectionStatus,
      tokenUsage,
      reconnect: () => chatSocketService.connect(),
      resetConversation: chatSocketService.resetConversation,
      runtime,
    }),
    [chatSocketService, connectionStatus, runtime, tokenUsage],
  );

  return (
    <ChatControlContext.Provider value={controls}>
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    </ChatControlContext.Provider>
  );
};
