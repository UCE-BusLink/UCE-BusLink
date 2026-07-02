# UCE-BusLink

**Sistema Inteligente de Transporte Universitario Nocturno — Universidad Central del Ecuador**

UCE-BusLink resuelve los problemas críticos del transporte nocturno universitario: elimina la espera sin información y reemplaza el modelo "el primero que llega, se sienta" con un sistema de reservas, seguimiento en tiempo real y notificaciones que garantizan un servicio seguro y predecible para toda la comunidad universitaria.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Spring Boot 3.2.5 · Java 21 · Maven multi-módulo |
| Frontend web | React 19 · TypeScript · Vite |
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
│       ├── desktop-ci.yml               # CI del frontend web en feature branches
│       ├── mobile-ci.yml                # CI del frontend mobile en feature branches
│       └── pr-validation.yml            # Validación de archivos críticos en PRs
│
├── docker/
│   ├── Dockerfile.backend               # Multi-stage build, usuario no-root
│   ├── Dockerfile.frontend              # Multi-stage build con Nginx
│   ├── nginx.conf                       # Configuración Nginx HTTP-only (Cloudflare Flexible SSL)
│   ├── docker-compose.yml               # Servicios base: db, redis, backend, frontend
│   ├── docker-compose.local.yml         # Overrides para desarrollo local
│   ├── docker-compose.qa.yml            # Overrides para el ambiente QA
│   ├── docker-compose.prod.yml          # Overrides para producción
│   ├── .env.qa.example                  # Plantilla de variables para QA
│   └── .env.prod.example                # Plantilla de variables para producción
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
│   └── uce-buslink-web/                 # Aplicación web (React 19 + Vite)
│
├── docs/
│   ├── architecture/                    # Documento de arquitectura (SAD)
│   └── diagrams/                        # Diagramas entidad-relación
│
├── .env.example                         # Plantilla de variables para desarrollo local
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
cp .env.example docker/.env
# Editar docker/.env con tus valores locales

# 3. Levantar todos los servicios
docker compose -f docker/docker-compose.yml -f docker/docker-compose.local.yml up -d

# 4. Verificar que todo esté healthy
docker ps --format "table {{.Names}}\t{{.Status}}"
```

La aplicación queda disponible en `http://localhost`.

---

## Variables de Entorno

Copia `.env.example` a `docker/.env` y completa los valores:

| Variable | Descripción |
|---|---|
| `POSTGRES_USER` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL |
| `POSTGRES_DB` | Nombre de la base de datos |
| `REDIS_PASSWORD` | Contraseña de Redis |
| `JWT_SECRET` | Secreto para firmar JWT (mínimo 32 caracteres) |
| `CLERK_SECRET_KEY` | Clave secreta de Clerk (backend) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk (frontend) |

> Nunca subas el archivo `.env` al repositorio. Está incluido en `.gitignore`.

Para QA y producción existen plantillas adicionales en `docker/.env.qa.example` y `docker/.env.prod.example`.

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
- Frontend — Build (`npm run build`)

---

## Pipeline CI/CD

| Evento | Resultado |
|---|---|
| Push a `feature/*` (cambios en backend) | Build y tests del backend |
| Push a `feature/*` (cambios en frontend) | Lint y build del frontend |
| PR hacia `qa` o `main` | Verifica compilación antes de permitir el merge |
| Merge a `qa` | Build imágenes Docker → push a Docker Hub → deploy automático en QA |
| Merge a `main` | Build imágenes Docker → push a Docker Hub → deploy en producción con aprobación manual → crea GitHub Release |

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
| Entrega final / sistema completo | Major: `0.x.x` → `1.0.0` |

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
