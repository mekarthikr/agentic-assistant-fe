import type { AssistantRuntime } from '@assistant-ui/react';
import type { ReactNode } from 'react';
import type { UserType } from './Component.types';

export type ChatDisplayMode = 'widget' | 'fullscreen';

export type ChatConnectionStatus =
  'connecting' | 'connected' | 'disconnected' | 'error';

export interface ChatRequest {
  requestId: string;
  conversationId: string;
  message: string;
  userType: UserType;
}

export interface ModelTokenUsage {
  model?: string;
  contextWindow?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens: number;
  contextTokensUsed?: number;
  contextTokensRemaining?: number;
  rateLimitRemainingTokens?: number | null;
}

export interface ChatServerMessage {
  type: string;
  requestId?: string;
  delta?: string;
  message?: string;
  timestamp?: number;
  model?: string;
  contextWindow?: number;
  tokenUsage?: ModelTokenUsage;
}

export interface PendingChatRequest {
  deltas: string[];
  done: boolean;
  error?: Error;
  wake?: () => void;
}

export interface ChatControlContextValue {
  connectionStatus: ChatConnectionStatus;
  tokenUsage: ModelTokenUsage | null;
  reconnect: () => Promise<void>;
  resetConversation: () => void;
  runtime: AssistantRuntime;
}

export interface ChatRuntimeProviderProps {
  children: ReactNode;
  userType: UserType;
}

export interface ThreadProps {
  mode: ChatDisplayMode;
  onClose: () => void;
  onCollapse?: () => void;
  onExpand?: () => void;
  userType?: UserType;
}

export interface EmptyThreadProps {
  mode: ChatDisplayMode;
  userType?: UserType;
}

export interface HeaderProps {
  mode: ChatDisplayMode;
  onClose: () => void;
  onCollapse?: () => void;
  onExpand?: () => void;
}

export interface ComposerProps {
  mode: ChatDisplayMode;
}
