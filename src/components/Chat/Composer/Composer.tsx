import { ComposerPrimitive, useAuiState } from '@assistant-ui/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type React from 'react';

import { ChatIcon } from '@app/components/ChatIcon';
import type { ComposerProps } from '@app/types';
import type { RagDocument, RagMode } from '@app/types';
import { documentService } from '@app/service';

const MAX_MESSAGE_LENGTH = 1_000;
const COUNTER_THRESHOLD = 800;

export const Composer: React.FC<ComposerProps> = ({ mode }) => {
  const [validationMessage, setValidationMessage] = useState('');
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ragMode, setRagMode] = useState<RagMode>('hybrid');
  const [documentError, setDocumentError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const text = useAuiState((state) => state.thread.composer.text);
  const isRunning = useAuiState((state) => state.thread.isRunning);
  const isDisabled = useAuiState((state) => state.thread.isDisabled);

  useEffect(() => {
    void documentService
      .list()
      .then(setDocuments)
      .catch((error: unknown) =>
        setDocumentError(
          error instanceof Error ? error.message : 'Could not load documents.',
        ),
      );
  }, []);

  useEffect(() => {
    documentService.setScope(ragMode, selectedIds);
  }, [ragMode, selectedIds]);

  const uploadDocument = async (file?: File) => {
    if (!file) return;
    setDocumentError('');
    setIsUploading(true);
    try {
      const document = await documentService.upload(file);
      setDocuments((current) => [
        document,
        ...current.filter(({ id }) => id !== document.id),
      ]);
      setSelectedIds((current) => [...new Set([...current, document.id])]);
    } catch (error) {
      setDocumentError(
        error instanceof Error ? error.message : 'Document upload failed.',
      );
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!text.trim()) {
      event.preventDefault();
      setValidationMessage('Enter a message before sending.');
      return;
    }

    setValidationMessage('');
  };

  const shellClassName =
    mode === 'fullscreen'
      ? 'grid grid-cols-[minmax(0,1fr)_2.75rem] grid-rows-[auto_auto] items-center gap-x-3 rounded-[20px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-colors focus-within:border-[#1677a2]/50'
      : 'grid grid-cols-[minmax(0,1fr)_2.75rem] grid-rows-[auto_auto] items-center gap-x-3 rounded-[18px] border border-slate-200 bg-white px-2.5 py-2 shadow-[0_6px_22px_rgba(15,23,42,0.08)] transition focus-within:border-[#1677a2]/50 focus-within:ring-2 focus-within:ring-[#1677a2]/10';

  const actionClassName =
    'grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b3a66] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#072b4d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677a2] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div
      className={
        mode === 'fullscreen'
          ? 'mx-auto w-full max-w-[56rem] px-4 pb-5 sm:px-6 sm:pb-7'
          : 'mx-auto w-full px-3 py-3'
      }
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="sr-only"
          onChange={(event) => void uploadDocument(event.target.files?.[0])}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInput.current?.click()}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-[#0b3a66] hover:bg-slate-50 disabled:opacity-50"
        >
          {isUploading ? 'Indexing…' : 'Upload document'}
        </button>
        <select
          aria-label="Document answer mode"
          value={ragMode}
          onChange={(event) => setRagMode(event.target.value as RagMode)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-600"
        >
          <option value="hybrid">Documents + assistant</option>
          <option value="document-only">Documents only</option>
        </select>
        {documents.filter(({ status }) => status === 'ready').length ? (
          <details className="relative">
            <summary className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600">
              {selectedIds.length
                ? `${selectedIds.length} selected`
                : 'All documents'}
            </summary>
            <div className="absolute bottom-9 left-0 z-30 max-h-48 min-w-64 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="mb-1 w-full rounded px-2 py-1 text-left font-medium hover:bg-slate-50"
              >
                Search all documents
              </button>
              {documents
                .filter(({ status }) => status === 'ready')
                .map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-50"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(document.id)}
                        onChange={(event) =>
                          setSelectedIds((current) =>
                            event.target.checked
                              ? [...new Set([...current, document.id])]
                              : current.filter((id) => id !== document.id),
                          )
                        }
                      />
                      <span className="max-w-48 truncate">{document.name}</span>
                    </label>
                    <button
                      type="button"
                      aria-label={`Delete ${document.name}`}
                      onClick={() => {
                        setDocumentError('');
                        void documentService
                          .delete(document.id)
                          .then(() => {
                            setDocuments((current) =>
                              current.filter(({ id }) => id !== document.id),
                            );
                            setSelectedIds((current) =>
                              current.filter((id) => id !== document.id),
                            );
                          })
                          .catch((error: unknown) =>
                            setDocumentError(
                              error instanceof Error
                                ? error.message
                                : 'Document deletion failed.',
                            ),
                          );
                      }}
                      className="rounded px-1.5 py-0.5 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>
          </details>
        ) : null}
        {documentError ? (
          <span role="alert" className="text-red-700">
            {documentError}
          </span>
        ) : null}
      </div>
      <ComposerPrimitive.Root
        onSubmit={handleSubmit}
        className={shellClassName}
      >
        <ComposerPrimitive.Input
          autoFocus={false}
          submitMode="enter"
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          placeholder="Ask about a policy, contract, claim, or product…"
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
              className={actionClassName}
            >
              <ChatIcon name="stop" className="size-4" />
            </ComposerPrimitive.Cancel>
          ) : (
            <ComposerPrimitive.Send
              title="Send message"
              aria-label="Send message"
              className={actionClassName}
            >
              <ChatIcon name="send" className="size-4" />
            </ComposerPrimitive.Send>
          )}
        </div>
      </ComposerPrimitive.Root>
      {mode === 'fullscreen' ? (
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Responses are grounded in available enterprise knowledge and records.
        </p>
      ) : null}
    </div>
  );
};
