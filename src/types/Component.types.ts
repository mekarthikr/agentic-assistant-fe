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

export type UserType = 'agent' | 'client';

export interface HomePageProps {
  userType: UserType | null;
  onUserTypeChange: (userType: UserType) => void;
  onOpenChat: (userType: UserType) => void;
}

export interface FullscreenChatPageProps {
  onClose: () => void;
  userType: UserType;
}

export interface AssistantModalProps {
  userType: UserType | null;
  onExpand: () => void;
}
