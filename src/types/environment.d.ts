interface ImportMetaEnv {
  readonly VITE_WS_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_WS_AUTH_TOKEN?: string;
  readonly VITE_SHOW_RAG_SOURCES?: string;
  readonly VITE_ENABLE_DOCUMENTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
