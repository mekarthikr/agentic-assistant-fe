import type React from 'react';

export const ChatPageLoading: React.FC = () => {
  return (
    <main
      aria-label="Loading full-screen assistant"
      className="app-canvas grid h-dvh place-items-center"
    >
      <div className="flex flex-col items-center gap-4" aria-live="polite">
        <span className="relative grid size-12 place-items-center rounded-2xl bg-[#0b3a66] text-white shadow-[0_12px_30px_rgba(11,58,102,0.22)]">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-[#0b3a66]/15" />
          <span className="relative size-2 rounded-full bg-white" />
        </span>
        <span className="text-sm font-medium text-slate-600">
          Preparing your assistant…
        </span>
      </div>
    </main>
  );
};
