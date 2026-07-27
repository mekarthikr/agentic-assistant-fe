import type React from 'react';

import type { AppLayoutProps } from '@app/types';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return <div className="min-h-dvh bg-[#f7f9fc]">{children}</div>;
};
