import { AssistantModalPrimitive } from '@assistant-ui/react';
import { lazy, Suspense } from 'react';
import type React from 'react';

import { ChatIcon } from '@app/components/ChatIcon';
import type { AssistantModalProps } from '@app/types';

const Thread = lazy(async () => await import('../Chat/Thread/Thread'));

export const AssistantModal: React.FC<AssistantModalProps> = ({
  open,
  userType,
  onOpenChange,
  onExpand,
}) => {
  if (!userType) return null;

  const expand = () => {
    onOpenChange(false);
    onExpand();
  };

  return (
    <AssistantModalPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AssistantModalPrimitive.Trigger
        title="Open Intelligent Assistant"
        aria-label="Open Intelligent Assistant chat"
        className="group fixed right-4 bottom-4 z-40 grid size-12 place-items-center rounded-xl border border-[#0b3a66] bg-[#0b3a66] text-white shadow-[0_6px_16px_rgba(11,58,102,0.2)] transition-colors hover:bg-[#072b4d] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1677a2] sm:right-6 sm:bottom-6"
      >
        <span className="relative">
          <ChatIcon name="sparkles" className="size-5" />
          <span className="status-pulse absolute -top-1 -right-1 size-2 rounded-full border border-[#0b3a66] bg-emerald-400" />
        </span>
      </AssistantModalPrimitive.Trigger>
      <AssistantModalPrimitive.Content
        side="top"
        align="end"
        sideOffset={12}
        aria-label="Intelligent Assistant chat dialog"
        className="z-50 h-[min(680px,calc(100dvh-6.5rem))] w-[calc(100vw-1rem)] overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.24)] ring-1 ring-slate-900/5 outline-none sm:w-[440px]"
      >
        <Suspense
          fallback={
            <div className="app-canvas grid h-full place-items-center text-sm font-medium text-slate-500">
              <span aria-live="polite">Loading assistant…</span>
            </div>
          }
        >
          <Thread
            mode="widget"
            onClose={() => onOpenChange(false)}
            onExpand={expand}
            userType={userType}
          />
        </Suspense>
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};
