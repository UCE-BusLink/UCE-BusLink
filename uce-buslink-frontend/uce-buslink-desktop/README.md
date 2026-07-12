# UCE Bus-Link Desktop

Electron desktop application exclusively for UCE Bus-Link administrators. It only includes the admin panel: dashboard, GPS map, routes, buses, stops, drivers, trips and profile.

## Requirements

- Node.js 20+
- A reachable backend (local at `http://localhost:8080`, or the QA/production environment)

## Environment configuration

The app reads its config from Vite mode-specific `.env` files, all present in this folder:

| File | Used by | Points to |
|---|---|---|
| `.env` | `npm run dev`, `npm run build`, `npm run dist` | whatever you set locally (defaults to production values if left as the template) |
| `.env.localhost` | `npm run dist:localhost` | `http://localhost:8080` backend |
| `.env.qa` | `npm run dist:qa` | `https://ucebuslinkqa.programacionwebuce.net` |
| `.env.production` | `npm run dist` (implicit, via `.env`) | `https://ucebuslinkprod.programacionwebuce.net` |

Each file defines:

```
VITE_API_URL=...
VITE_WS_URL=...
VITE_CLERK_PUBLISHABLE_KEY=...
```

Copy `.env.example` to `.env` and fill in `VITE_CLERK_PUBLISHABLE_KEY` before your first run. Without it, the app falls back to the default development Clerk key.

## Development

```bash
npm install
npm run dev
```

This runs Vite on `127.0.0.1:5173` (already whitelisted in the backend CORS config) and launches the Electron window once the dev server is ready, with HMR enabled.

## Building the renderer only

```bash
npm run build
```

Type-checks (`tsc -b`) and bundles the renderer into `dist/`. This does not produce an installer — use one of the `dist*` scripts below for that.

## Packaging installers (`dist`, `dist:qa`, `dist:localhost`, `dist:all`)

Each `dist*` script builds the renderer against a specific environment file and then runs `electron-builder` with a distinct app id and product name, so the three variants can be installed side by side on the same machine without overwriting each other.

```bash
npm run dist            # production build, uses .env, appId ec.uce.buslink.desktop
npm run dist:qa         # QA build, uses .env.qa, appId ec.uce.buslink.desktop.qa
npm run dist:localhost  # local build, uses .env.localhost, appId ec.uce.buslink.desktop.localhost
npm run dist:all        # runs the three builds above sequentially
```

`dist:all` is the one to use when you need installers for all three environments in one go (for example, before a release or when handing off builds for testing). It simply chains `dist`, `dist:qa` and `dist:localhost` — expect it to take noticeably longer since it triggers three full Vite builds and three `electron-builder` packaging runs back to back.

All installers are written to `release/`:

```
release/
  UCE BusLink Admin Setup <version>.exe          (production, NSIS installer)
  UCE BusLink Admin <version>.exe                 (production, portable)
  QA UCE BusLink Admin Setup <version>.exe        (QA, NSIS installer)
  QA UCE BusLink Admin <version>.exe              (QA, portable)
  LocalHost UCE BusLink Admin Setup <version>.exe (local, NSIS installer)
  LocalHost UCE BusLink Admin <version>.exe       (local, portable)
  win-unpacked/                                   (last unpacked build, any variant)
```

On Windows, `electron-builder` produces both an NSIS installer and a portable `.exe` (see the `win.target` list in `package.json`). Mac (`dmg`) and Linux (`AppImage`, `deb`) targets are configured but only get built if you run the packaging step on that platform.

### Running the generated installers

- The **`... Setup <version>.exe`** files are NSIS installers: double-click to run the install wizard (choose install directory, create desktop/start menu shortcuts), then launch the app from the shortcut it creates. Since `nsis.oneClick` is set to `false` in `package.json`, the wizard always asks for confirmation and install location instead of installing silently.
- The plain **`... Admin <version>.exe`** files (without "Setup" in the name) are portable builds: run them directly, no installation step needed. Useful for quick testing without touching the machine's installed programs.
- Only one variant should be installed at a time via the NSIS installer if you want a single Start Menu entry; if you need production, QA and local side by side, either install one via NSIS and run the other two as portable `.exe`, or rely on their distinct `appId`s to keep them as separate installed applications.

For the packaged app to reach Clerk, `app://buslink` must be registered as an allowed origin on the corresponding Clerk instance (Clerk Dashboard -> Native applications, or via the API using `allowed_origins`). This applies per environment: the QA build talks to the QA Clerk instance, the production build to the production one, and so on.

## Differences from the web app

- The Electron main process serves the built renderer with SPA fallback to `index.html`, so `BrowserRouter` behaves the same as on the web.
- `VITE_API_URL` must be an absolute URL; there is no `/api` proxy like in the web dev server.
- Sign-up is disabled: administrators do not self-register from this app. Their accounts are provisioned through another channel (see the backend's `AdminService`).
- If an account without the `ADMIN` role signs in, a restricted-access screen is shown with a sign-out option.
