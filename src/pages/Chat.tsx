import type React from 'react';

import { Thread } from '@app/components/Chat/Thread';
import type { FullscreenChatPageProps } from '@app/types';

const FullscreenChatPage: React.FC<FullscreenChatPageProps> = ({
  onCollapse,
  onClose,
  userType,
}) => {
  return (
    <main
      aria-label={`Full-screen ${userType} chat`}
      className="h-dvh overflow-hidden bg-[#f7f9fc]"
    >
      <Thread
        mode="fullscreen"
        onClose={onClose}
        onCollapse={onCollapse}
        userType={userType}
      />
    </main>
  );
};

export default FullscreenChatPage;
