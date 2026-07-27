import type { AssistantRuntime } from '@assistant-ui/react';
import type { ReactNode } from 'react';

export type ChatDisplayMode = 'widget' | 'fullscreen';

export type ChatConnectionStatus =
  'connecting' | 'connected' | 'disconnected' | 'error';

export interface ChatHistoryMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatControlContextValue {
  connectionStatus: ChatConnectionStatus;
  reconnect: () => Promise<void>;
  runtime: AssistantRuntime;
}

export interface ChatRuntimeProviderProps {
  children: ReactNode;
}

export interface ThreadProps {
  mode: ChatDisplayMode;
  onClose: () => void;
  onExpand?: () => void;
}

export interface EmptyThreadProps {
  mode: ChatDisplayMode;
}

export interface HeaderProps {
  mode: ChatDisplayMode;
  onClose: () => void;
  onExpand?: () => void;
}

export interface ComposerProps {
  mode: ChatDisplayMode;
}
