import type { ReactNode } from 'react';

export type ChatIconName =
  | 'arrow-down'
  | 'close'
  | 'copy'
  | 'expand'
  | 'external-link'
  | 'plus'
  | 'retry'
  | 'send'
  | 'shield'
  | 'sparkles'
  | 'stop';

export interface ChatIconProps {
  name: ChatIconName;
  className?: string;
}

export interface AppLayoutProps {
  children: ReactNode;
}

export interface HomePageProps {
  onOpenChat: () => void;
}

export interface FullscreenChatPageProps {
  onClose: () => void;
}

export interface AssistantModalProps {
  onExpand: () => void;
}
