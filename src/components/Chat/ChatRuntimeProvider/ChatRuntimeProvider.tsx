import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

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
  const previousUserType = useRef(userType);
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
  useEffect(() => {
    if (previousUserType.current === userType) return;

    previousUserType.current = userType;
    runtime.thread.cancelRun();
    chatSocketService.resetConversation();
    runtime.thread.reset();
  }, [chatSocketService, runtime, userType]);

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
