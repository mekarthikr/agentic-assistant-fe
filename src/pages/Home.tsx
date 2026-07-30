import { useState } from 'react';
import type React from 'react';

import type { HomePageProps, UserType } from '@app/types';

export const HomePage: React.FC<HomePageProps> = ({ onOpenChat }) => {
  const [userType, setUserType] = useState<UserType>('agent');

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 text-slate-900">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Intellegent Assistant
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
          A focused workspace for product, contract, and case questions.
        </p>
        <fieldset className="mx-auto mt-8 max-w-md">
          <legend className="text-sm font-semibold text-slate-700">
            Continue as
          </legend>
          <div className="mt-3 grid grid-cols-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(['agent', 'client'] as const).map((type) => {
              const selected = userType === type;
              const label = type === 'agent' ? 'Agent' : 'Client';

              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setUserType(type)}
                  className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3a66] ${
                    selected
                      ? 'bg-[#0b3a66] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <button
          type="button"
          onClick={() => onOpenChat(userType)}
          className="mt-6 rounded-xl bg-[#0b3a66] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#082e52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3a66]"
        >
          Continue as {userType === 'agent' ? 'Agent' : 'Client'}
        </button>
      </section>
    </main>
  );
};
