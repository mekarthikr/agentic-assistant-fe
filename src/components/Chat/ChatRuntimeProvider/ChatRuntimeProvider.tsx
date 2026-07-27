import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { ChatApiService, createChatAdapter } from '@app/service';
import type {
  ChatControlContextValue,
  ChatRuntimeProviderProps,
} from '@app/types';
import { ChatControlContext } from './ChatControlContext';

export const ChatRuntimeProvider = ({ children }: ChatRuntimeProviderProps) => {
  const [chatApiService] = useState(() => new ChatApiService());
  const adapter = useMemo(
    () => createChatAdapter(chatApiService),
    [chatApiService],
  );
  const runtime = useLocalRuntime(adapter);
  const connectionStatus = useSyncExternalStore(
    chatApiService.subscribe,
    chatApiService.getStatus,
    chatApiService.getStatus,
  );

  useEffect(() => {
    void chatApiService.connect().catch(() => undefined);
    return () => chatApiService.close();
  }, [chatApiService]);

  const controls = useMemo<ChatControlContextValue>(
    () => ({
      connectionStatus,
      reconnect: () => chatApiService.connect(),
      runtime,
    }),
    [chatApiService, connectionStatus, runtime],
  );

  return (
    <ChatControlContext.Provider value={controls}>
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    </ChatControlContext.Provider>
  );
};
