import { AssistantModalPrimitive } from '@assistant-ui/react';
import { lazy, Suspense, useState } from 'react';
import type React from 'react';

import { ChatIcon } from '@app/components/ChatIcon';
import type { AssistantModalProps } from '@app/types';

const Thread = lazy(async () => await import('../Chat/Thread/Thread'));

export const AssistantModal: React.FC<AssistantModalProps> = ({
  userType,
  onExpand,
}) => {
  const [open, setOpen] = useState(false);

  if (!userType) return null;

  const expand = () => {
    setOpen(false);
    onExpand();
  };

  return (
    <AssistantModalPrimitive.Root open={open} onOpenChange={setOpen}>
      <AssistantModalPrimitive.Trigger
        title="Open Agent Assist"
        aria-label="Open Agent Assist chat"
        className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-2xl bg-[#0b3a66] text-white shadow-[0_14px_35px_rgba(11,58,102,0.3)] transition-transform hover:-translate-y-1 hover:bg-[#082e52] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b3a66] motion-reduce:transform-none sm:right-6 sm:bottom-6"
      >
        <ChatIcon name="sparkles" className="size-6" />
      </AssistantModalPrimitive.Trigger>
      <AssistantModalPrimitive.Content
        side="top"
        align="end"
        sideOffset={12}
        aria-label="Agent Assist chat dialog"
        className="z-50 h-[min(620px,calc(100dvh-7.5rem))] w-[calc(100vw-1rem)] overflow-hidden rounded-[22px] border border-slate-200/90 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] outline-none sm:w-[420px]"
      >
        <Suspense
          fallback={
            <div className="grid h-full place-items-center bg-[#f7f9fc] text-sm text-slate-500">
              <span aria-live="polite">Loading assistant…</span>
            </div>
          }
        >
          <Thread
            mode="widget"
            onClose={() => setOpen(false)}
            onExpand={expand}
            userType={userType}
          />
        </Suspense>
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};
