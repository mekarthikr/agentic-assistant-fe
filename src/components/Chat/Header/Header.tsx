import { useAui } from '@assistant-ui/react';
import type React from 'react';

import { useChatControl } from '@app/components/Chat/ChatRuntimeProvider';
import { ChatIcon } from '@app/components/ChatIcon';
import type { HeaderProps } from '@app/types';

export const Header: React.FC<HeaderProps> = ({ mode, onClose, onExpand }) => {
  const aui = useAui();
  const { connectionStatus, reconnect } = useChatControl();
  const isConnected = connectionStatus === 'connected';

  const startNewChat = () => {
    aui.thread().cancelRun();
    aui.thread().reset();
  };

  return (
    <header
      className={
        mode === 'fullscreen'
          ? 'pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-5 pt-4 sm:px-6'
          : 'flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 sm:px-5'
      }
    >
      <div
        className={
          mode === 'fullscreen'
            ? 'pointer-events-auto flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-2 pr-4 shadow-[0_2px_8px_rgba(15,23,42,0.08)]'
            : 'flex min-w-0 items-center gap-3'
        }
      >
        <span
          className={
            mode === 'fullscreen'
              ? 'grid size-9 shrink-0 place-items-center rounded-[10px] border border-sky-100 bg-[#eaf3fb] text-[#0b3a66]'
              : 'grid size-9 shrink-0 place-items-center rounded-[11px] bg-[#eaf3fb] text-[#0b3a66]'
          }
        >
          <ChatIcon name="shield" className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <h1
            className={
              mode === 'fullscreen'
                ? 'truncate text-[13px] leading-4 font-semibold text-slate-950'
                : 'truncate text-[15px] leading-5 font-semibold text-slate-950'
            }
          >
            Agent Assist
          </h1>
          <button
            type="button"
            disabled={isConnected || connectionStatus === 'connecting'}
            onClick={() => void reconnect().catch(() => undefined)}
            title={isConnected ? 'Chat service connected' : 'Reconnect chat'}
            className="flex items-center gap-1.5 text-[10px] leading-3 text-slate-500 disabled:cursor-default"
          >
            <span
              className={`size-1.5 shrink-0 rounded-full ${
                isConnected
                  ? 'bg-emerald-500'
                  : connectionStatus === 'connecting'
                    ? 'animate-pulse bg-amber-400'
                    : 'bg-red-500'
              }`}
            />
            {isConnected
              ? 'Chat connected'
              : connectionStatus === 'connecting'
                ? 'Connecting…'
                : 'Reconnect chat'}
          </button>
        </div>
      </div>

      <div
        className={
          mode === 'fullscreen'
            ? 'pointer-events-auto flex shrink-0 items-center gap-1 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)]'
            : 'flex shrink-0 items-center gap-0.5'
        }
      >
        <button
          type="button"
          onClick={startNewChat}
          title="Start a new chat"
          aria-label="Start a new chat"
          className="chat-icon-button"
        >
          <ChatIcon
            name={mode === 'fullscreen' ? 'plus' : 'retry'}
            className="size-4"
          />
        </button>
        {mode === 'widget' && onExpand ? (
          <button
            type="button"
            onClick={onExpand}
            title="Open full-screen assistant"
            aria-label="Open full-screen assistant"
            className="chat-icon-button"
          >
            <ChatIcon name="expand" className="size-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          title={mode === 'widget' ? 'Close assistant' : 'Return to home'}
          aria-label={mode === 'widget' ? 'Close assistant' : 'Return to home'}
          className="chat-icon-button"
        >
          <ChatIcon name="close" className="size-4" />
        </button>
      </div>
    </header>
  );
};
