# UCE Bus-Link Web

Web app for UCE Bus-Link students: dashboard, seat reservations, routes, live bus tracking and profile.

## Requirements

- Node.js 20+
- A reachable backend (see [`uce-buslink-backend/README.md`](../../uce-buslink-backend/README.md) to run it standalone)

## Environment configuration

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend proxy target. Use `/api`, the dev server proxies it to `http://localhost:8080` (see `vite.config.ts`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_GOOGLE_CLIENT_ID` | Google client ID, only needed for the Google SSO button |
| `VITE_MICROSOFT_CLIENT_ID` / `VITE_MICROSOFT_TENANT_ID` | Only needed for the Microsoft SSO button |
| `VITE_FIREBASE_*` | Firebase web config, only needed for push notifications |

## Development

```bash
npm install
npm run dev
```

`predev` runs `build:wasm` automatically, compiling `wasm/geo.ts` (AssemblyScript) into `src/wasm/geo.wasm` before Vite starts. The dev server proxies `/api` to `http://localhost:8080`, so a locally running backend is picked up without any extra configuration.

## Building for production

```bash
npm run build
```

Runs `build:wasm`, then `tsc -b` and `vite build`. Output goes to `dist/`.

## Storybook

```bash
npm run storybook
```

Isolated component catalog on port 6006. Not part of the production build.
