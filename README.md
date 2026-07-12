# UCE-BusLink

**Sistema Inteligente de Transporte Universitario Nocturno — Universidad Central del Ecuador**

UCE-BusLink resuelve los problemas críticos del transporte nocturno universitario: elimina la espera sin información y reemplaza el modelo "el primero que llega, se sienta" con un sistema de reservas, seguimiento en tiempo real y notificaciones que garantizan un servicio seguro y predecible para toda la comunidad universitaria.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Spring Boot 3.2.5 · Java 21 · Maven multi-módulo |
| Frontend web | React 19 · TypeScript · Vite |
| Frontend desktop | Electron · React 19 · TypeScript |
| Frontend mobile | React Native · Expo · TypeScript |
| Base de datos | PostgreSQL 15 + PostGIS |
| Caché | Redis 7.2 |
| Autenticación | Clerk |
| Contenedores | Docker · Docker Compose |
| Registry | Docker Hub |
| CI/CD | GitHub Actions |
| Cloud | AWS EC2 |

---

## Estructura del Repositorio

```
UCE-BusLink/
├── .github/
│   └── workflows/
│       ├── ci.yml                       # Status checks en PRs hacia qa y main
│       ├── deploy.yml                   # Build, push y deploy a QA y producción
│       ├── backend-ci.yml               # CI del backend en feature branches
│       ├── web-ci.yml                   # CI del frontend web en feature branches
│       ├── desktop-ci.yml               # CI del frontend desktop (Electron) en feature branches
│       ├── mobile-ci.yml                # CI del frontend mobile en feature branches
│       └── pr-validation.yml            # Validación de archivos críticos en PRs
│
├── docker/
│   ├── Dockerfile.backend               # Multi-stage build, usuario no-root
│   ├── Dockerfile.frontend              # Multi-stage build con Nginx (app web)
│   ├── Dockerfile.storybook             # Multi-stage build con Nginx (catálogo de componentes)
│   ├── nginx.conf                       # Configuración Nginx con proxy /api/ y WebSocket
│   ├── nginx.storybook.conf             # Configuración Nginx estática para Storybook
│   ├── docker-compose.yml               # Servicios base: db, redis, backend, frontend
│   ├── docker-compose.local.yml         # Overrides para desarrollo local (incluye storybook)
│   ├── docker-compose.qa.yml            # Overrides para el ambiente QA
│   └── docker-compose.prod.yml          # Overrides para producción
│
├── uce-buslink-backend/
│   ├── uce-buslink-shared-kernel/       # Dominio compartido entre módulos
│   ├── uce-buslink-identity-module/     # Autenticación y gestión de usuarios
│   ├── uce-buslink-fleet-module/        # Gestión de flota y conductores
│   ├── uce-buslink-reservations-module/ # Reservas de asiento
│   ├── uce-buslink-tracking-module/     # Seguimiento GPS en tiempo real
│   ├── uce-buslink-notifications-module/ # Notificaciones push y alertas
│   └── uce-buslink-main/                # Entry point y configuración global
│
├── uce-buslink-frontend/
│   ├── uce-buslink-web/                 # Aplicación web para browser (React 19 + Vite + Nginx)
│   ├── uce-buslink-desktop/             # Aplicación de escritorio para administradores (Electron)
│   └── uce-buslink-mobile/              # Aplicación móvil para pasajeros (React Native + Expo)
│
├── .env.example                         # Plantilla de variables de entorno
├── .dockerignore
└── .gitignore
```

---

## Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24+
- [Git](https://git-scm.com/)

---

## Levantar el Entorno Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/UCE-BusLink/UCE-BusLink.git
cd UCE-BusLink

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores locales

# 3. Levantar todos los servicios
docker compose -f docker/docker-compose.yml -f docker/docker-compose.local.yml up -d

# 4. Verificar que todo esté healthy
docker ps --format "table {{.Names}}\t{{.Status}}"
```

La aplicación web queda disponible en `http://localhost:3000`, el backend en `http://localhost:8080` y el catálogo de componentes (Storybook) en `http://localhost:6006`.

---

## Variables de Entorno

Copia `.env.example` a `.env` en la raíz del proyecto y completa los valores:

### Backend

| Variable | Descripción |
|---|---|
| `APP_NAME` | Nombre de la aplicación |
| `SERVER_PORT` | Puerto del servidor Spring Boot (por defecto `8080`) |
| `DB_URL` | URL JDBC de PostgreSQL |
| `DB_USERNAME` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `JPA_SHOW_SQL` | Mostrar SQL en logs (`true` / `false`) |
| `HIBERNATE_DDL_AUTO` | Estrategia DDL de Hibernate (`validate` en prod) |
| `REDIS_HOST` | Host de Redis |
| `REDIS_PORT` | Puerto de Redis (por defecto `6379`) |
| `REDIS_PASSWORD` | Contraseña de Redis |
| `FLYWAY_ENABLED` | Activar migraciones Flyway (`true` / `false`) |
| `JWT_SECRET` | Secreto para firmar JWT (mínimo 64 caracteres) |
| `JWT_EXPIRATION_MS` | Duración del token en milisegundos |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth2 |
| `GOOGLE_MAPS_API_KEY` | API Key de Google Maps |
| `MICROSOFT_TENANT_ID` | Tenant ID de Microsoft OAuth2 |
| `CLERK_SECRET_KEY` | Clave secreta de Clerk (backend) |

### Contenedor PostgreSQL

| Variable | Descripción |
|---|---|
| `POSTGRES_USER` | Usuario inicial de la base de datos |
| `POSTGRES_PASSWORD` | Contraseña inicial de la base de datos |
| `POSTGRES_DB` | Nombre de la base de datos |

### Frontend y Docker

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API para Vite (usar `/api` en Docker) |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google para el frontend |
| `VITE_MICROSOFT_CLIENT_ID` | Client ID de Microsoft para el frontend |
| `VITE_MICROSOFT_TENANT_ID` | Tenant ID de Microsoft para el frontend |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk para el frontend |
| `BACKEND_TAG` | Tag de la imagen Docker del backend a usar |
| `FRONTEND_TAG` | Tag de la imagen Docker del frontend a usar |
| `SPRING_PROFILES_ACTIVE` | Perfil de Spring activo (`dev`, `qa`, `prod`) |

> Nunca subas el archivo `.env` al repositorio. Está incluido en `.gitignore`.

---

## Flujo de Ramas

```
feature/* ──► dev ──► qa ──► main
```

| Rama | Propósito |
|---|---|
| `feature/*` | Desarrollo de funcionalidades |
| `dev` | Integración continua del equipo |
| `qa` | Ambiente de pruebas — deploy automático al hacer merge |
| `main` | Producción — requiere aprobación del equipo |

Todo PR hacia `qa` o `main` requiere que pasen los siguientes checks:

- Backend — Build & Test (`mvn clean verify`)
- Frontend — Lint & Build (`npm run build`)

---

## Pipeline CI/CD

| Evento | Resultado |
|---|---|
| Push a `feature/*` (cambios en backend) | Build y tests del backend |
| Push a `feature/*` (cambios en frontend web) | Lint y build del frontend web |
| Push a `feature/*` (cambios en frontend desktop) | Lint y build del frontend desktop |
| Push a `feature/*` (cambios en frontend mobile) | Lint y build del frontend mobile |
| PR hacia `qa` o `main` | Verifica compilación antes de permitir el merge |
| Merge a `qa` | Build imágenes Docker → push a Docker Hub → deploy automático en QA |
| Merge a `main` | Build imágenes Docker → push a Docker Hub → deploy en producción con aprobación manual → crea GitHub Release |

### Imágenes Docker

| Imagen | Descripción |
|---|---|
| `rodneyandrade/uce-buslink-backend` | API Spring Boot |
| `rodneyandrade/uce-buslink-frontend-web` | Frontend web servido con Nginx |

---

## Ambientes

| Ambiente | Rama | Tipo de deploy |
|---|---|---|
| Local | cualquiera | Docker Compose local |
| QA | `qa` | AWS EC2 — automático |
| Producción | `main` | AWS EC2 — aprobación manual del equipo |

---

## Versionado

La versión del proyecto vive en `uce-buslink-backend/pom.xml`. El equipo la actualiza manualmente antes de cada PR a `main`.

| Tipo de cambio | Acción |
|---|---|
| Fix o mejora pequeña | Patch: `0.1.0` → `0.1.1` |
| Feature nueva completa | Minor: `0.1.x` → `0.2.0` |
| Entrega final / sistema completo | Major: `0.x.x` → `1.1.0` |

Al mergear a `main`, el pipeline crea automáticamente el git tag `vX.Y.Z` y el GitHub Release correspondiente. Las imágenes Docker se publican con tres tags: `:X.Y.Z`, `:prod` y `:latest`.

---

## Autores

| Nombre | Rol |
|---|---|
| Lenin David Alomoto Cevallos | Backend |
| Rodney Jhosue Andrade Chamorro | DevOps |
| Kennet Steveen Rodriguez Lopez | Frontend |
| Melany Vanessa Vela Loachamin | Scrum Master |

---

Universidad Central del Ecuador — Programación Web
