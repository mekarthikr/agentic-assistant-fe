import {
  ActionBarPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
  type SourceMessagePartProps,
} from '@assistant-ui/react';
import type React from 'react';

import { Composer } from '@app/components/Chat/Composer';
import { Header } from '@app/components/Chat/Header';
import { MarkdownText } from '@app/components/Chat/MarkdownText';
import { ChatIcon } from '@app/components/ChatIcon';
import type { EmptyThreadProps, ThreadProps, UserType } from '@app/types';

const CLIENT_SUGGESTIONS = [
  'Download policy document',
  'File a claim',
  'Premium grace period',
] as const;

const AGENT_SUGGESTIONS = [
  'Product features',
  'Claim documents',
  'Transfer procedures',
  'Contract details',
] as const;

const getGreetingName = (userType?: UserType): string =>
  userType === 'client' ? 'Smith Robert' : 'Aarathi Ajith';

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const EmptyPart: React.FC = () => null;

const SourcePill: React.FC<SourceMessagePartProps> = ({
  sourceType,
  title,
  url,
}) => {
  const label = title ? `RAG source · ${title}` : 'RAG source';

  if (sourceType === 'url') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 mr-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-sky-200/80 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-[#0b3a66] transition-colors hover:border-sky-300 hover:bg-[#e8f1f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677a2]"
      >
        <span className="truncate">{label}</span>
        <ChatIcon name="external-link" className="size-3.5 shrink-0" />
      </a>
    );
  }

  return (
    <span className="mt-3 mr-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-sky-200/80 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-[#0b3a66]">
      <ChatIcon name="shield" className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
};

const MessageActions: React.FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="never"
      className="pointer-events-none mt-1.5 flex h-8 gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
    >
      <ActionBarPrimitive.Copy
        title="Copy response"
        aria-label="Copy response"
        className="chat-icon-button size-8"
      >
        <ChatIcon name="copy" className="size-3.5" />
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload
        title="Retry response"
        aria-label="Retry response"
        className="chat-icon-button size-8"
      >
        <ChatIcon name="retry" className="size-3.5" />
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const WidgetAssistantMessage: React.FC = () => {
  const hasContent = useAuiState((state) => state.message.content.length > 0);
  const createdAt = useAuiState((state) => state.message.createdAt);

  if (!hasContent) return null;

  return (
    <MessagePrimitive.Root className="chat-message group mx-auto grid w-full max-w-[52rem] grid-cols-[1.75rem_minmax(0,1fr)] gap-2.5 px-3 py-2.5 sm:grid-cols-[2rem_minmax(0,1fr)] sm:px-5 sm:py-3">
      <span className="mt-5 grid size-7 place-items-center rounded-xl bg-[#0b3a66] text-white shadow-sm sm:size-8">
        <ChatIcon name="sparkles" className="size-3.5 sm:size-4" />
      </span>
      <div className="min-w-0">
        <p className="mb-1.5 text-[11px] font-semibold text-slate-500">
          Agent Assist
        </p>
        <div className="flex min-w-0 items-end gap-2">
          <div className="min-w-0 max-w-full rounded-[18px] rounded-bl-md border border-sky-100/80 bg-[#e8f1f8] px-3.5 py-2.5 text-[13px] leading-6 text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] min-[360px]:max-w-[calc(100%-3.5rem)] sm:max-w-[85%] sm:text-sm sm:leading-7">
            <MessagePrimitive.Parts components={assistantMessageComponents} />
          </div>
          <time
            dateTime={createdAt.toISOString()}
            className="hidden shrink-0 pb-1 text-[10px] text-slate-400 min-[360px]:block"
          >
            {TIME_FORMATTER.format(createdAt)}
          </time>
        </div>
        <MessageActions />
      </div>
    </MessagePrimitive.Root>
  );
};

const WidgetUserMessage: React.FC = () => {
  const createdAt = useAuiState((state) => state.message.createdAt);

  return (
    <MessagePrimitive.Root className="chat-message mx-auto flex w-full max-w-[52rem] justify-end px-3 py-2.5 sm:px-5 sm:py-3">
      <div className="flex max-w-[86%] flex-col items-end sm:max-w-[72%]">
        <div className="overflow-hidden rounded-[18px] rounded-br-md bg-[#0b3a66] px-3.5 py-2.5 text-[13px] leading-5 break-words whitespace-pre-wrap text-white shadow-[0_8px_20px_rgba(11,58,102,0.14)] sm:text-sm sm:leading-6">
          <MessagePrimitive.Parts />
        </div>
        <time
          dateTime={createdAt.toISOString()}
          className="mt-1 px-1 text-[10px] text-slate-400"
        >
          {TIME_FORMATTER.format(createdAt)}
        </time>
      </div>
    </MessagePrimitive.Root>
  );
};

const assistantMessageComponents = {
  Text: MarkdownText,
  Source: SourcePill,
  Empty: EmptyPart,
};

const FullscreenAssistantMessage: React.FC = () => {
  const hasContent = useAuiState((state) => state.message.content.length > 0);

  if (!hasContent) return null;

  return (
    <MessagePrimitive.Root className="chat-message group mx-auto grid w-full max-w-[56rem] grid-cols-[2rem_minmax(0,1fr)] gap-3 px-4 py-4 sm:px-6">
      <span className="grid size-8 place-items-center rounded-xl bg-[#0b3a66] text-white shadow-sm">
        <ChatIcon name="sparkles" className="size-4" />
      </span>
      <div className="min-w-0 pt-1 text-sm leading-7 text-slate-700">
        <MessagePrimitive.Parts components={assistantMessageComponents} />
        <MessageActions />
      </div>
    </MessagePrimitive.Root>
  );
};

const FullscreenUserMessage: React.FC = () => {
  return (
    <MessagePrimitive.Root className="chat-message mx-auto flex w-full max-w-[56rem] justify-end px-4 py-4 sm:px-6">
      <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-br-md bg-[#0b3a66] px-4 py-2.5 text-sm leading-6 break-words whitespace-pre-wrap text-white sm:max-w-[72%]">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
};

const widgetThreadMessageComponents = {
  UserMessage: WidgetUserMessage,
  AssistantMessage: WidgetAssistantMessage,
};

const fullscreenThreadMessageComponents = {
  UserMessage: FullscreenUserMessage,
  AssistantMessage: FullscreenAssistantMessage,
};

const ConversationDate: React.FC = () => {
  const createdAt = useAuiState((state) => state.thread.messages[0]?.createdAt);

  if (!createdAt) return null;

  return (
    <div className="mx-auto flex w-full max-w-[52rem] items-center gap-3 px-4 pt-4 pb-2 sm:px-5">
      <span className="h-px flex-1 bg-slate-200" />
      <time
        dateTime={createdAt.toISOString()}
        className="shrink-0 text-[10px] font-medium text-slate-400"
      >
        {DATE_FORMATTER.format(createdAt)}
      </time>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
};

const EmptyThread: React.FC<EmptyThreadProps> = ({ mode, userType }) => {
  const aui = useAui();
  const greetingName = getGreetingName(userType);
  const isClient = userType === 'client';
  const assistantLabel = `Intelligent Assistant for ${
    isClient ? 'Client' : 'Agent'
  }`;
  const suggestions = isClient ? CLIENT_SUGGESTIONS : AGENT_SUGGESTIONS;
  const helperText = isClient
    ? 'Get help with policy documents, claims, premium payments, beneficiaries, and customer support.'
    : 'Explore product, claims, and premium guidance from our reference documents.';

  const submitSuggestion = (prompt: string) => {
    const composer = aui.thread().composer();
    composer.setText(prompt);
    composer.send();
  };

  if (mode === 'fullscreen') {
    return (
      <section className="mx-auto flex w-full max-w-[40rem] flex-col px-5 pt-8 pb-4 text-left sm:min-h-[calc(100dvh-12rem)] sm:translate-y-6 sm:justify-center sm:pb-20">
        <div className="w-fit items-center gap-2 rounded-full border border-sky-200/80 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0b3a66] sm:inline-flex">
          <ChatIcon name="shield" className="size-3.5" />
          {assistantLabel}
        </div>
        <h2 className="mt-5 max-w-[38rem] text-[34px] leading-[1.04] font-semibold tracking-[-0.045em] text-balance text-slate-950 sm:text-[48px]">
          Hi {greetingName}, what can I help you find?
        </h2>
        <p className="mt-4 max-w-[34rem] text-[15px] leading-7 text-slate-500">
          {helperText}
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => submitSuggestion(suggestion)}
              className="group/suggestion flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-sky-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677a2]"
            >
              <span>{suggestion}</span>
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#e8f1f8] text-slate-400 transition-colors group-hover/suggestion:bg-[#0b3a66] group-hover/suggestion:text-white">
                <ChatIcon name="send" className="size-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-6">
      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2.5 sm:grid-cols-[2rem_minmax(0,1fr)]">
        <span className="mt-5 grid size-7 place-items-center rounded-full bg-[#0b3a66] text-white sm:size-8">
          <ChatIcon name="sparkles" className="size-3.5 sm:size-4" />
        </span>
        <div className="min-w-0">
          <p className="mb-1.5 text-[11px] font-semibold text-slate-500">
            Agent Assist
          </p>
          <div className="rounded-[18px] rounded-bl-md bg-[#eaf3fb] px-4 py-3 text-[13px] leading-6 text-slate-700 sm:text-sm">
            <p className="font-medium text-slate-900">
              Hi {greetingName}, what can I help you find?
            </p>
            <p className="mt-1">{helperText}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col items-end gap-2.5 pl-10 sm:pl-16">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => submitSuggestion(suggestion)}
            className="max-w-full rounded-full border border-[#0b3a66] bg-white px-4 py-2 text-right text-xs font-medium text-[#0b3a66] transition-colors hover:bg-[#eaf3fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3a66] sm:text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
};

const ThreadActivity: React.FC = () => {
  const isLoading = useAuiState((state) => state.thread.isLoading);
  const isRunning = useAuiState((state) => state.thread.isRunning);

  if (!isLoading && !isRunning) return null;

  return (
    <div
      aria-live="polite"
      className="mx-auto flex w-full max-w-[52rem] items-center gap-3 px-4 py-3 text-xs text-slate-500 sm:px-6"
    >
      <span className="grid size-8 place-items-center rounded-full bg-[#0b3a66] text-white">
        <ChatIcon name="sparkles" className="size-4" />
      </span>
      <span>
        {isLoading ? 'Loading conversation…' : 'Preparing a response…'}
      </span>
    </div>
  );
};

const Thread: React.FC<ThreadProps> = ({
  mode,
  onClose,
  onCollapse,
  onExpand,
  userType,
}) => {
  return (
    <section
      aria-label={
        mode === 'widget'
          ? 'Agent Assist chat dialog'
          : 'Agent Assist full-screen conversation'
      }
      className={
        mode === 'fullscreen'
          ? 'relative flex h-full min-h-0 flex-col overflow-hidden bg-[#f4f7fb] text-slate-900'
          : 'relative flex h-full min-h-0 flex-col overflow-hidden bg-white text-slate-900'
      }
    >
      <Header
        mode={mode}
        onClose={onClose}
        onCollapse={onCollapse}
        onExpand={onExpand}
      />
      <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
        <ThreadPrimitive.Viewport
          className={
            mode === 'fullscreen'
              ? 'chat-scrollbar relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-transparent pt-20'
              : 'chat-scrollbar relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-[#f8fafc]'
          }
        >
          <ThreadPrimitive.Empty>
            <EmptyThread mode={mode} userType={userType} />
          </ThreadPrimitive.Empty>
          {mode === 'widget' ? <ConversationDate /> : null}
          <ThreadPrimitive.Messages
            components={
              mode === 'fullscreen'
                ? fullscreenThreadMessageComponents
                : widgetThreadMessageComponents
            }
          />
          <ThreadActivity />
          <ThreadPrimitive.ScrollToBottom
            title="Scroll to latest message"
            aria-label="Scroll to latest message"
            className={
              mode === 'fullscreen'
                ? 'sticky bottom-36 z-10 mx-auto mb-2 grid size-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:-translate-y-0.5 hover:text-[#0b3a66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3a66] disabled:invisible'
                : 'sticky bottom-3 z-10 mx-auto mb-2 grid size-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:-translate-y-0.5 hover:text-[#0b3a66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3a66] disabled:invisible'
            }
          >
            <ChatIcon name="arrow-down" className="size-4" />
          </ThreadPrimitive.ScrollToBottom>
          {mode === 'fullscreen' ? (
            <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto bg-[#f4f7fb] pt-4">
              <Composer mode="fullscreen" />
            </ThreadPrimitive.ViewportFooter>
          ) : null}
        </ThreadPrimitive.Viewport>
        {mode === 'widget' ? (
          <div className="shrink-0 border-t border-slate-200/70 bg-white">
            <Composer mode="widget" />
          </div>
        ) : null}
      </ThreadPrimitive.Root>
    </section>
  );
};

export default Thread;
