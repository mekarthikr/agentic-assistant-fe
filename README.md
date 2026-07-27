# agentic-assistant-fe

React 19 and TypeScript frontend for Agentic Assistant, built with Vite and Tailwind CSS.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Getting started

```bash
npm install
copy .env.example .env
npm run dev
```

The chat UI connects to the backend over a native browser WebSocket. Configure
`VITE_WS_URL` when the backend is not available at
`ws://localhost:5000/ws`. If backend authentication is enabled, set
`VITE_WS_AUTH_TOKEN` to the matching `SOCKET_AUTH_TOKEN`.

The assistant-ui runtime is provided by `ChatRuntimeProvider`. Its
`ChatControlContext` exposes the connection status, reconnect action, and chat
runtime to UI components. Chat responses are streamed from the backend; the UI
does not contain mock messages or a mock model adapter.

## Available scripts

- `npm run dev` starts the Vite development server.
- `npm run build` type-checks and creates a production build.
- `npm run preview` previews the production build locally.
- `npm run lint` checks the project with ESLint.
- `npm run lint:fix` fixes supported ESLint issues.
- `npm run format` checks formatting with Prettier.
- `npm run format:fix` fixes formatting with Prettier.

Staged files are automatically formatted and linted before each commit using Husky and lint-staged.

## Author

Aspire Systems
