import type React from 'react';

import type { AppLayoutProps } from '@app/types';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return <div className="app-canvas min-h-dvh">{children}</div>;
};
