import type { RagDocument, RagMode } from '@app/types';

const apiUrl =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://agentic-assistant-be.vercel.app';

const headers = (): HeadersInit => {
  const token = import.meta.env.VITE_WS_AUTH_TOKEN as string | undefined;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseError = async (response: Response): Promise<never> => {
  const body = (await response.json().catch(() => ({}))) as {
    message?: string;
  };
  throw new Error(
    body.message || `Document request failed (${response.status}).`,
  );
};

class DocumentService {
  private selectedIds: string[] = [];
  private mode: RagMode = 'hybrid';

  public getChatScope(): { ragMode: RagMode; documentIds?: string[] } {
    return {
      ragMode: this.mode,
      ...(this.selectedIds.length
        ? { documentIds: [...this.selectedIds] }
        : {}),
    };
  }

  public setScope(mode: RagMode, selectedIds: string[]): void {
    this.mode = mode;
    this.selectedIds = [...selectedIds];
  }

  public async list(): Promise<RagDocument[]> {
    const response = await fetch(`${apiUrl}/documents`, { headers: headers() });
    if (!response.ok) return parseError(response);
    const body = (await response.json()) as { documents: RagDocument[] };
    return body.documents;
  }

  public async upload(file: File): Promise<RagDocument> {
    const body = new FormData();
    body.append('document', file);
    const response = await fetch(`${apiUrl}/documents`, {
      method: 'POST',
      headers: headers(),
      body,
    });
    if (!response.ok) return parseError(response);
    return ((await response.json()) as { document: RagDocument }).document;
  }

  public async delete(documentId: string): Promise<void> {
    const response = await fetch(`${apiUrl}/documents/${documentId}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!response.ok && response.status !== 204) return parseError(response);
  }
}

export const documentService = new DocumentService();
