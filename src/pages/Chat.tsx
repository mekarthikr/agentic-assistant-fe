import type React from 'react';

import { Thread } from '@app/components/Chat/Thread';
import type { FullscreenChatPageProps } from '@app/types';

export const FullscreenChatPage: React.FC<FullscreenChatPageProps> = ({
  onClose,
}) => {
  return (
    <main
      aria-label="Full-screen assistant chat"
      className="h-dvh overflow-hidden bg-[#f7f9fc]"
    >
      <Thread mode="fullscreen" onClose={onClose} />
    </main>
  );
};

export default FullscreenChatPage;
