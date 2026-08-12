import type React from 'react';

import { ChatIcon } from '@app/components/ChatIcon';
import type { HomePageProps, UserType } from '@app/types';

const ROLE_OPTIONS: ReadonlyArray<{
  type: UserType;
  title: string;
  description: string;
}> = [
  {
    type: 'agent',
    title: 'Agent',
    description: 'Products, contracts, claims, and service procedures.',
  },
  {
    type: 'client',
    title: 'Client',
    description: 'Policies, payments, documents, and customer support.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  userType,
  onUserTypeChange,
  onOpenChat,
}) => {
  const selectedRole = ROLE_OPTIONS.find(({ type }) => type === userType);

  return (
    <main className="poc-canvas grid min-h-dvh place-items-center px-5 py-10 text-slate-950 sm:px-8">
      <section className="w-full max-w-[42rem]" aria-labelledby="poc-title">
        <div className="text-center">
          {/* <span className="mx-auto grid size-11 place-items-center rounded-xl border border-[#0b3a66] bg-[#0b3a66] text-white">
            <ChatIcon name="sparkles" className="size-5" />
          </span>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Proof of concept
          </div> */}
          <h1
            id="poc-title"
            className="mx-auto mt-4 max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.04em] text-balance text-[#0b3a66] sm:text-5xl"
          >
            Intelligent Chat Assistant
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#47647f] sm:text-base">
            Explore a conversational assistant grounded in enterprise knowledge
            and connected customer records.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <fieldset>
            <legend className="sr-only">Assistant role</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLE_OPTIONS.map((role) => {
                const selected = userType === role.type;

                return (
                  <button
                    key={role.type}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onUserTypeChange(role.type)}
                    className={`focus-ring relative rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? 'border-[#0b3a66] bg-[#f4f8fb]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block pr-7 text-sm font-semibold text-slate-900">
                      {role.title}
                    </span>
                    <span className="mt-1 block pr-5 text-xs leading-5 text-slate-500">
                      {role.description}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute top-4 right-4 grid size-4 place-items-center rounded-full border ${
                        selected
                          ? 'border-[#0b3a66] bg-[#0b3a66]'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selected ? (
                        <span className="size-1 rounded-full bg-white" />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={!userType}
              onClick={() => userType && onOpenChat(userType)}
              className="primary-button focus-ring shrink-0"
            >
              {selectedRole
                ? `Continue as ${selectedRole.title}`
                : 'Select a persona'}
              <ChatIcon name="send" className="size-3.5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
