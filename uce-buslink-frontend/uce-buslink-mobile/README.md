# UCE Bus-Link — App móvil (React Native / Expo)

Versión móvil (APK) del frontend Desktop. Mantiene el **mismo diseño, la misma lógica y los mismos roles** (Estudiante, Conductor, Administrador), reutilizando las clases de Tailwind vía **NativeWind**.

## Stack

- **Expo SDK 52** + React Native 0.76 (genera APK con EAS Build)
- **NativeWind v4** — mismas clases Tailwind que el desktop (colores `navy-*`, etc.)
- **React Navigation** — Drawer (réplica del Sidebar) + Stack, con redirección por rol
- **@clerk/clerk-expo** — autenticación (email/clave + Google/Microsoft OAuth)
- **react-native-maps** — reemplaza Leaflet (mapas, paradas, polilíneas, bus en vivo)
- **expo-camera** + **react-native-qrcode-svg** — escaneo y generación de QR
- **@stomp/stompjs** — tracking GPS en tiempo real (WebSocket)
- **expo-location** — publicación de ubicación del conductor

## Configuración

Copia `.env.example` a `.env` y ajusta:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...      # misma instancia que el desktop
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080           # backend (ver nota abajo)
EXPO_PUBLIC_WS_URL=                                 # opcional; si vacío se deriva de API_URL
```

> **Importante sobre `EXPO_PUBLIC_API_URL`** — en un dispositivo/APK `localhost` apunta al
> teléfono, no a tu PC:
> - Emulador Android: `http://10.0.2.2:8080`
> - Dispositivo físico (misma red): `http://<IP-LAN-de-tu-PC>:8080`
> - Producción: `https://api.tu-dominio.com`

### Clerk (móvil)
En el dashboard de Clerk añade el redirect/scheme nativo `ucebuslink://` y habilita
Google/Microsoft para nativo. La key es la misma del desktop.

### Google Maps (Android)
Para mapas en Android coloca tu API key en `app.json` →
`android.config.googleMaps.apiKey`.

## Desarrollo

```bash
npm install
npx expo start          # abre con Expo Go o un dev build
# o directo a Android:
npx expo run:android
```

## Generar el APK

```bash
npm install -g eas-cli
eas login
eas build:configure       # crea/asocia el projectId (se guarda en app.json > extra.eas)
npm run build:apk         # = eas build -p android --profile preview  (genera .apk)
```

El perfil `preview` (en `eas.json`) produce un **APK** instalable directamente.
El perfil `production` produce un **AAB** para Play Store.

## Estructura (espejo del desktop)

```
src/
  config/        env y URLs (sustituye import.meta.env)
  types/         idéntico al desktop
  services/      idéntico (sólo cambia la base URL)
  hooks/         idéntico (cambia import de Clerk a @clerk/clerk-expo)
  context/       AuthContext (Clerk Expo) con sync de rol al backend
  data/          mockData
  utils/         mapUtils (adaptado a react-native-maps)
  components/
    atoms/ molecules/   UI portada a RN + NativeWind
    auth/ layout/        OAuth, header, contenedores
  screens/       pantallas (estudiante, driver/, admin/, auth/)
  navigation/    Drawer por rol + Stack + RootNavigator (gating de auth)
```

Los roles se resuelven igual que en el desktop: tras `login`, `AuthContext` llama a
`/api/v1/auth/sync` y según `role` (`STUDENT` / `DRIVER` / `ADMIN`) el `DrawerContent`
muestra el menú correspondiente y `RootNavigator` enruta a las pantallas permitidas.
