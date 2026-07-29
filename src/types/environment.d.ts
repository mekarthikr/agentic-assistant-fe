interface ImportMetaEnv {
  readonly VITE_WS_URL?: string;
  readonly VITE_WS_AUTH_TOKEN?: string;
  readonly VITE_USER_DISPLAY_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
