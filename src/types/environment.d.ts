interface ImportMetaEnv {
  readonly VITE_WS_URL?: string;
  readonly VITE_WS_AUTH_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
