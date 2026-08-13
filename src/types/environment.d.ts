interface ImportMetaEnv {
  readonly VITE_WS_URL?: string;
  readonly VITE_WS_AUTH_TOKEN?: string;
  readonly VITE_SHOW_RAG_SOURCES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
