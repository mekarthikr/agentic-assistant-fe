export interface KnowledgeIndexResult {
  collection: string;
  indexedSections: number;
  removedSections: number;
  sourceHash: string;
}

const getApiBaseUrl = (): string => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const websocketUrl = import.meta.env.VITE_WS_URL?.trim();
  if (websocketUrl) {
    const url = new URL(websocketUrl);
    url.protocol = url.protocol === 'wss:' ? 'https:' : 'http:';
    url.pathname = '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  }

  return 'http://localhost:5000';
};

export const reindexKnowledge = async (): Promise<KnowledgeIndexResult> => {
  const token = import.meta.env.VITE_RAG_INDEX_TOKEN?.trim();
  if (!token) {
    throw new Error('The indexing trigger token is not configured.');
  }

  const response = await fetch(`${getApiBaseUrl()}/knowledge/reindex`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = (await response.json()) as Partial<KnowledgeIndexResult> & {
    message?: string;
  };
  if (!response.ok) {
    throw new Error(payload.message || 'Knowledge indexing failed.');
  }

  return payload as KnowledgeIndexResult;
};
