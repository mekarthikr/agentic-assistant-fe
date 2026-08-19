# agentic-assistant-fe

React 19 and TypeScript frontend for Intellegent Assistant, built with Vite and Tailwind CSS.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Getting started

```bash
npm install
copy .env.example .env
npm run dev
```

The chat UI connects to `https://agentic-assistant-be.vercel.app/` over a native
browser WebSocket at `wss://agentic-assistant-be.vercel.app/ws`. Configure
`VITE_WS_URL` to override that endpoint. If backend authentication is enabled,
set `VITE_WS_AUTH_TOKEN` to the backend's optional shared
`SOCKET_AUTH_TOKEN`. Set `VITE_SHOW_RAG_SOURCES=true` to display RAG source
pills.

Set `VITE_API_URL` to the backend HTTP origin for document uploads. The composer
can upload PDF, DOCX, TXT, and Markdown files, search all ready documents or a selected
subset, and switch between hybrid and document-only answers. These controls are
hidden by default; set `VITE_ENABLE_DOCUMENTS=true` to enable them. The default
answer mode is hybrid (`Documents + assistant`).

The assistant-ui runtime is provided by `ChatRuntimeProvider`. Its
`ChatControlContext` exposes connection status, reconnect action, and chat
runtime to UI components. The home-page toggle selects Agent or Client and
each chat request carries that selection. The backend maps it to the
hardcoded profile and data scope. Chat responses are streamed from the
backend; the UI does not contain mock messages or a mock model adapter. After
each response, the header distinguishes aggregate turn usage, final-request
context capacity, and Groq's remaining per-minute token allowance.

## Available scripts

- `npm run dev` starts the Vite development server.
- `npm run build` type-checks and creates a production build.
- `npm run preview` previews the production build locally.
- `npm run lint` checks the project with ESLint.
- `npm run lint:fix` fixes supported ESLint issues.
- `npm run format` checks formatting with Prettier.
- `npm run format:fix` fixes formatting with Prettier.

The Husky pre-commit hook checks formatting, linting, and the production build.

## Author

Aspire Systems
