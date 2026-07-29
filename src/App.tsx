import { lazy, Suspense } from 'react';
import type React from 'react';

import { ChatRuntimeProvider } from '@app/components/Chat/ChatRuntimeProvider';
import { ChatPageLoading } from '@app/components/ChatPageLoading';
import { usePathname } from '@app/hooks/usePathname';
import { AppLayout } from '@app/layouts/AppLayout';
import { HomePage } from '@app/pages/Home';
import type { UserType } from '@app/types';

const FullscreenChatPage = lazy(async () => await import('./pages/Chat'));

export const App = (): React.JSX.Element => {
  const { pathname, navigate } = usePathname();
  const requestedUserType = new URLSearchParams(window.location.search).get(
    'userType',
  );
  const userType: UserType | null =
    requestedUserType === 'agent' || requestedUserType === 'client'
      ? requestedUserType
      : null;
  const isChatPage = pathname === '/chat' && userType !== null;

  return (
    <ChatRuntimeProvider
      key={userType ?? 'agent'}
      userType={userType ?? 'agent'}
    >
      <AppLayout>
        {isChatPage ? (
          <Suspense fallback={<ChatPageLoading />}>
            <FullscreenChatPage
              userType={userType}
              onClose={() => navigate('/')}
            />
          </Suspense>
        ) : (
          <HomePage onOpenChat={(type) => navigate(`/chat?userType=${type}`)} />
        )}
      </AppLayout>
    </ChatRuntimeProvider>
  );
};
