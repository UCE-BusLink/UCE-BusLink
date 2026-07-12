# UCE Bus-Link — Mobile app (React Native / Expo)

Mobile version (APK) of the desktop frontend. Keeps the **same design, logic and roles** (Student, Driver, Administrator), reusing Tailwind classes via **NativeWind**.

## Stack

- **Expo SDK 52** + React Native 0.76 (builds APKs via EAS Build)
- **NativeWind v4** — same Tailwind classes as the desktop app (`navy-*` colors, etc.)
- **React Navigation** — Drawer (mirrors the Sidebar) + Stack, with role-based redirection
- **@clerk/clerk-expo** — authentication (email/password + Google/Microsoft OAuth)
- **react-native-maps** — replaces Leaflet (maps, stops, polylines, live bus)
- **expo-camera** + **react-native-qrcode-svg** — QR scanning and generation
- **@stomp/stompjs** — live GPS tracking (WebSocket)
- **expo-location** — publishes the driver's location

## Configuration

Copy `.env.example` to `.env` and set:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...      # same instance as the desktop app
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080           # backend (see note below)
EXPO_PUBLIC_WS_URL=                                 # optional; derived from API_URL if empty
```

> **Important note on `EXPO_PUBLIC_API_URL`** — on a device/APK, `localhost` points to
> the phone, not your PC:
> - Android emulator: `http://10.0.2.2:8080`
> - Physical device (same network): `http://<your-PC-LAN-IP>:8080`
> - Production: `https://api.your-domain.com`

### Clerk (mobile)
In the Clerk dashboard, add the native redirect/scheme `ucebuslink://` and enable
Google/Microsoft for native. Uses the same key as the desktop app.

### Google Maps (Android)
For maps on Android, set your API key in `app.json` →
`android.config.googleMaps.apiKey`.

## Development

```bash
npm install
npx expo start          # opens with Expo Go or a dev build
# or straight to Android:
npx expo run:android
```

## Building the APK

```bash
npm install -g eas-cli
eas login
eas build:configure       # creates/links the projectId (saved in app.json > extra.eas)
npm run build:apk         # = eas build -p android --profile preview (produces an .apk)
```

The `preview` profile (in `eas.json`) produces a directly installable **APK**.
The `production` profile produces an **AAB** for the Play Store.

## Structure (mirrors the desktop app)

```
src/
  config/        env and URLs (replaces import.meta.env)
  types/         identical to the desktop app
  services/      identical (only the base URL changes)
  hooks/         identical (Clerk import switches to @clerk/clerk-expo)
  context/       AuthContext (Clerk Expo) with role sync against the backend
  data/          mockData
  utils/         mapUtils (adapted to react-native-maps)
  components/
    atoms/ molecules/   UI ported to RN + NativeWind
    auth/ layout/        OAuth, header, containers
  screens/       screens (student, driver/, admin/, auth/)
  navigation/    Drawer per role + Stack + RootNavigator (auth gating)
```

Roles are resolved the same way as in the desktop app: after `login`, `AuthContext` calls
`/api/v1/auth/sync` and, based on `role` (`STUDENT` / `DRIVER` / `ADMIN`), `DrawerContent`
shows the corresponding menu and `RootNavigator` routes to the allowed screens.
