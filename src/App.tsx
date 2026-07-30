import { lazy, Suspense, useState } from 'react';
import type React from 'react';

import { AssistantModal } from '@app/components/AssistantModal';
import { ChatRuntimeProvider } from '@app/components/Chat/ChatRuntimeProvider';
import { ChatPageLoading } from '@app/components/ChatPageLoading';
import { usePathname } from '@app/hooks/usePathname';
import { AppLayout } from '@app/layouts/AppLayout';
import { HomePage } from '@app/pages/Home';
import type { UserType } from '@app/types';

const FullscreenChatPage = lazy(async () => await import('./pages/Chat'));

export const App = (): React.JSX.Element => {
  const { pathname, navigate } = usePathname();
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(
    'agent',
  );
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const requestedUserType = new URLSearchParams(window.location.search).get(
    'userType',
  );
  const userType: UserType | null =
    requestedUserType === 'agent' || requestedUserType === 'client'
      ? requestedUserType
      : null;
  const isChatPage = pathname === '/chat' && userType !== null;
  const runtimeUserType: UserType =
    isChatPage && userType ? userType : (selectedUserType ?? 'agent');

  return (
    <ChatRuntimeProvider userType={runtimeUserType}>
      <AppLayout>
        {isChatPage ? (
          <Suspense fallback={<ChatPageLoading />}>
            <FullscreenChatPage
              userType={userType}
              onCollapse={() => {
                setSelectedUserType(userType);
                setIsWidgetOpen(true);
                navigate('/');
              }}
              onClose={() => {
                setIsWidgetOpen(false);
                navigate('/');
              }}
            />
          </Suspense>
        ) : (
          <>
            <HomePage
              userType={selectedUserType}
              onUserTypeChange={setSelectedUserType}
              onOpenChat={(type) => {
                setIsWidgetOpen(false);
                navigate(`/chat?userType=${type}`);
              }}
            />
            <AssistantModal
              open={isWidgetOpen}
              userType={selectedUserType}
              onOpenChange={setIsWidgetOpen}
              onExpand={() => {
                if (selectedUserType) {
                  setIsWidgetOpen(false);
                  navigate(`/chat?userType=${selectedUserType}`);
                }
              }}
            />
          </>
        )}
      </AppLayout>
    </ChatRuntimeProvider>
  );
};
