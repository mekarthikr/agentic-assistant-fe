import { ComposerPrimitive, useAuiState } from '@assistant-ui/react';
import { useState, type FormEvent } from 'react';
import type React from 'react';

import { ChatIcon } from '@app/components/ChatIcon';
import type { ComposerProps } from '@app/types';

const MAX_MESSAGE_LENGTH = 1_000;
const COUNTER_THRESHOLD = 800;

export const Composer: React.FC<ComposerProps> = ({ mode }) => {
  const [validationMessage, setValidationMessage] = useState('');
  const text = useAuiState((state) => state.thread.composer.text);
  const isRunning = useAuiState((state) => state.thread.isRunning);
  const isDisabled = useAuiState((state) => state.thread.isDisabled);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!text.trim()) {
      event.preventDefault();
      setValidationMessage('Enter a message before sending.');
      return;
    }

    setValidationMessage('');
  };

  return (
    <div
      className={
        mode === 'fullscreen'
          ? 'mx-auto w-full max-w-[54rem] px-4 pb-5 sm:px-5 sm:pb-6'
          : 'mx-auto w-full px-3 py-3'
      }
    >
      <ComposerPrimitive.Root
        onSubmit={handleSubmit}
        className={
          mode === 'fullscreen'
            ? 'grid grid-cols-[minmax(0,1fr)_2.75rem] grid-rows-[auto_auto] items-center gap-x-3 rounded-[20px] border border-slate-200/90 bg-white px-2.5 py-2 shadow-[0_12px_36px_rgba(15,23,42,0.09)] focus-within:border-slate-300'
            : 'grid grid-cols-[minmax(0,1fr)_2.75rem] grid-rows-[auto_auto] items-center gap-x-3 rounded-[16px] border border-slate-200 bg-white px-2.5 py-2 shadow-[0_5px_18px_rgba(15,23,42,0.07)] focus-within:border-slate-300'
        }
      >
        <ComposerPrimitive.Input
          autoFocus={false}
          submitMode="enter"
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          placeholder="Ask about a contract, product, or case..."
          aria-describedby="composer-help composer-validation composer-counter"
          className="col-start-1 row-start-1 max-h-36 min-h-9 w-full resize-none overflow-y-auto bg-transparent px-2 pt-2 pb-0 text-[15px] leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDisabled}
          onChange={(event) => {
            if (validationMessage && event.currentTarget.value.trim()) {
              setValidationMessage('');
            }
          }}
        />

        <div
          className={
            mode === 'fullscreen'
              ? 'col-start-1 row-start-2 flex min-h-6 items-center justify-between gap-3 px-2 pb-1 text-[10px] text-slate-400'
              : 'col-start-1 row-start-2 flex min-h-4 items-center justify-between gap-3 px-2 text-[9px] text-slate-400'
          }
        >
          <div className="min-w-0">
            <span id="composer-help">
              Enter to send · Shift + Enter for a new line
            </span>
            <p
              id="composer-validation"
              aria-live="polite"
              className={
                validationMessage
                  ? 'mt-1 inline-block rounded-md bg-red-50 px-2 py-1 text-red-700'
                  : 'sr-only'
              }
            >
              {validationMessage || 'Message is valid.'}
            </p>
            <p
              id="composer-counter"
              className={
                text.length >= COUNTER_THRESHOLD
                  ? 'ml-2 inline font-mono text-slate-500'
                  : 'sr-only'
              }
            >
              {text.length.toLocaleString()} /{' '}
              {MAX_MESSAGE_LENGTH.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="col-start-2 row-span-2 row-start-1 grid place-items-center">
          {isRunning ? (
            <ComposerPrimitive.Cancel
              title="Stop response"
              aria-label="Stop generating response"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b3a66] text-white shadow-sm transition-colors hover:bg-[#082e52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3a66] disabled:opacity-50"
            >
              <ChatIcon name="stop" className="size-4" />
            </ComposerPrimitive.Cancel>
          ) : (
            <ComposerPrimitive.Send
              title="Send message"
              aria-label="Send message"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b3a66] text-white shadow-sm transition-colors hover:bg-[#082e52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3a66] disabled:cursor-not-allowed"
            >
              <ChatIcon name="send" className="size-4" />
            </ComposerPrimitive.Send>
          )}
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};
