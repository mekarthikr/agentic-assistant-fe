import { createContext, useContext } from 'react';

import type { ChatControlContextValue } from '@app/types';

export const ChatControlContext = createContext<ChatControlContextValue | null>(
  null,
);

export const useChatControl = (): ChatControlContextValue => {
  const context = useContext(ChatControlContext);
  if (!context) {
    throw new Error('useChatControl must be used inside ChatRuntimeProvider.');
  }
  return context;
};
