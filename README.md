# Agentic Assistant frontend

React 19 and TypeScript frontend for Agentic Assistant, built with Vite and
Tailwind CSS.

## Local setup

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

## Environment variables

| Variable | Required on Vercel | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Public backend origin with no path, for example `https://your-be.vercel.app`. |

`VITE_API_URL` is embedded in the browser bundle. It must never contain a
secret. Add it to Production, Preview, and Development in Vercel when those
environments should use the backend.

## Deploy as the frontend Vercel project

1. Import this repository in Vercel as a second, separate project.
2. Keep the project root at the repository root.
3. Vercel detects Vite and runs `npm run build`; the included rewrite enables
   SPA deep links.
4. Add `VITE_API_URL` using the backend project's production URL.
5. Deploy.
6. Add this frontend project's exact URL to the backend project's
   `CORS_ORIGIN`, then redeploy the backend.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` type-checks and creates a production build.
- `npm run preview` previews the production build locally.
- `npm run lint` checks the source.
