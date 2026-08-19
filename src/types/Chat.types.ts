import type { AssistantRuntime } from '@assistant-ui/react';
import type { ReactNode } from 'react';
import type { UserType } from './Component.types';

type ChatDisplayMode = 'widget' | 'fullscreen';

export type ChatConnectionStatus =
  'connecting' | 'connected' | 'disconnected' | 'error';

export interface ChatRequest {
  requestId: string;
  conversationId: string;
  message: string;
  userType: UserType;
  ragMode?: RagMode;
  documentIds?: string[];
}

export type RagMode = 'document-only' | 'hybrid';

export interface RagDocument {
  id: string;
  name: string;
  mediaType: string;
  size: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  error?: string;
  createdAt: string;
  updatedAt: string;
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

export interface ChatSource {
  id: string;
  title: string;
  filename: string;
  mediaType: string;
  page?: number;
  documentId?: string;
  section?: string;
}

export type ChatStreamEvent =
  | { type: 'delta'; delta: string }
  | { type: 'complete'; sources: ChatSource[] };

export interface ChatServerMessage {
  type: string;
  requestId?: string;
  delta?: string;
  message?: string;
  timestamp?: number;
  model?: string;
  contextWindow?: number;
  tokenUsage?: ModelTokenUsage;
  sources?: ChatSource[];
}

export interface PendingChatRequest {
  deltas: string[];
  done: boolean;
  error?: Error;
  sources?: ChatSource[];
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
