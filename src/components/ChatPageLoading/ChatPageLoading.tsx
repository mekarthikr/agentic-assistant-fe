import type React from 'react';

export const ChatPageLoading: React.FC = () => {
  return (
    <main
      aria-label="Loading full-screen assistant"
      className="grid h-dvh place-items-center text-sm text-slate-500"
    >
      <span aria-live="polite">Loading assistant…</span>
    </main>
  );
};
