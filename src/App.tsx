import { lazy, Suspense } from 'react';
import type React from 'react';

import { AssistantModal } from '@app/components/AssistantModal';
import { ChatRuntimeProvider } from '@app/components/Chat/ChatRuntimeProvider';
import { ChatPageLoading } from '@app/components/ChatPageLoading';
import { usePathname } from '@app/hooks/usePathname';
import { AppLayout } from '@app/layouts/AppLayout';
import { HomePage } from '@app/pages/Home';

const FullscreenChatPage = lazy(async () => await import('./pages/Chat'));

export const App = (): React.JSX.Element => {
  const { pathname, navigate } = usePathname();
  const isChatPage = pathname === '/chat';

  return (
    <ChatRuntimeProvider>
      <AppLayout>
        {isChatPage ? (
          <Suspense fallback={<ChatPageLoading />}>
            <FullscreenChatPage onClose={() => navigate('/')} />
          </Suspense>
        ) : (
          <>
            <HomePage onOpenChat={() => navigate('/chat')} />
            <AssistantModal onExpand={() => navigate('/chat')} />
          </>
        )}
      </AppLayout>
    </ChatRuntimeProvider>
  );
};
