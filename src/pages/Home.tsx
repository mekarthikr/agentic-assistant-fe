import type React from 'react';

import type { HomePageProps } from '@app/types';

export const HomePage: React.FC<HomePageProps> = ({ onOpenChat }) => {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 text-slate-900">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Intellegent Assistant
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
          A focused workspace for product, contract, and case questions.
        </p>
        <button
          type="button"
          onClick={onOpenChat}
          className="mt-8 rounded-xl bg-[#0b3a66] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#082e52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3a66]"
        >
          Open assistant
        </button>
      </section>
    </main>
  );
};
