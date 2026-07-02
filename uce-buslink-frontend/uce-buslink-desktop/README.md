# UCE Bus-Link Desktop

Aplicación de escritorio (Electron) exclusiva para administradores de UCE Bus-Link. Incluye únicamente el panel de administración: dashboard, mapa GPS, rutas, buses, paradas, choferes, viajes y perfil.

## Requisitos

- Node.js 20+
- Backend corriendo (local en `http://localhost:8080` o el ambiente de QA/prod)

## Configuración

Copia `.env.example` a `.env` y ajusta los valores:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL absoluta del backend (sin proxy nginx, a diferencia del web) |
| `VITE_WS_URL` | URL del WebSocket de tracking |
| `VITE_CLERK_PUBLISHABLE_KEY` | Publishable key de Clerk |

Sin `.env`, la app usa `http://localhost:8080` y la key de desarrollo de Clerk por defecto.

## Desarrollo

```bash
npm install
npm run dev
```

Levanta Vite en el puerto 5173 (origen ya permitido en el CORS del backend) y abre la ventana de Electron con HMR.

## Build y empaquetado

```bash
npm run build   # typecheck + bundle del renderer en dist/
npm run dist    # genera el instalador de Windows (NSIS) en release/
```

La app empaquetada se sirve con el protocolo `app://buslink`, ya permitido en el CORS del backend. Para que el login de Clerk funcione en la app empaquetada, hay que registrar `app://buslink` en los allowed origins de la instancia de Clerk (Dashboard → Native applications, o vía API con `allowed_origins`).

## Diferencias con el web

- El proceso principal de Electron sirve el build con fallback SPA a `index.html`, por lo que `BrowserRouter` funciona igual que en el web.
- `VITE_API_URL` debe ser absoluta; no hay proxy `/api`.
- Solo login: los administradores no se registran desde la app; sus cuentas se crean por otro canal.
- Si una cuenta sin rol `ADMIN` inicia sesión, se muestra una pantalla de acceso restringido con opción de cerrar sesión.
