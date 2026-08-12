interface ImportMetaEnv {
  readonly VITE_WS_URL?: string;
  readonly VITE_WS_AUTH_TOKEN?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_RAG_INDEX_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
