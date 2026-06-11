# UCE-BusLink

# Sistema Inteligente de Transporte Universitario Nocturno — Universidad Central del Ecuador

UCE-BusLink resuelve los problemas críticos del transporte nocturno universitario: elimina la espera en la oscuridad sin información, y reemplaza el modelo "el primero que llega, se sienta" con un sistema de reservas, seguimiento en tiempo real y notificaciones que garantizan un servicio seguro y predecible para toda la comunidad universitaria.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Spring Boot 3.2.5 · Java 21 · Maven multi-módulo |
| Web | React 19 · TypeScript · Vite |
| Mobile | React Native |
| Base de datos | PostgreSQL 15 + PostGIS |
| Caché | Redis 7.2 |
| Autenticación | Clerk |
| Contenedores | Docker · Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | AWS EC2 · Docker Hub |

---
```bash

## Estructura del Repositorio

UCE-BusLink/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                         # Status checks en
│   │   ├── deploy.yml                     # Deploy a QA y producción
│   │   ├── backend-ci.yml                 # CI del backend en feature branches
│   │   ├── desktop-ci.yml                 # CI del frontend web en feature branches
│   │   ├── mobile-ci.yml                  # CI del frontend mobile en feature branches
│   │   └── pr-validation.yml              # Validación de archivos críticos en PRs
│   └── CODEOWNERS                         # Revisores obligat
│
├── docker/
│   ├── Dockerfile.backend                 # Multi-stage build
│   ├── Dockerfile.frontend                # Multi-stage build del frontend web
│   ├── nginx.conf                         # Configuración Nginx (QA)
│   ├── nginx.prod.conf                    # Configuración Ngi
│   ├── docker-compose.yml                 # Servicios base (db, redis, backend, frontend)
│   ├── docker-compose.local.yml           # Overrides para de
│   ├── docker-compose.qa.yml              # Overrides para ambiente QA
│   └── docker-compose.prod.yml            # Overrides para producción
│
├── uce-buslink-backend/
│   ├── uce-buslink-shared-kernel/         # Dominio compartid
│   ├── uce-buslink-identity-module/       # Autenticación y gestión de usuarios
│   ├── uce-buslink-reservations-module/   # Reservas de asiento
│   ├── uce-buslink-tracking-module/       # Seguimiento GPS e
│   ├── uce-buslink-notifications-module/  # Notificaciones push y alertas
│   ├── uce-buslink-supervisor-module/     # Panel de supervisión del servicio
│   └── uce-buslink-main/                  # Entry point y con
│
├── uce-buslink-frontend/
│   ├── uce-buslink-desktop/               # Aplicación web (React 19 + Vite)
│   │   ├── src/
│   │   ├── public/
│   │   └── vite.config.ts
│   └── uce-buslink-mobile/                # Aplicación móvil (React Native)
│                             
├── .env.example                           # Plantilla de variables de entorno
├── .dockerignore
└── README.md
```
---

## Requisitos Previos

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

La aplicación queda disponible en http://localhost.

---
Variables de Entorno

Copia .env.example a docker/.env y completa los valores:

┌────────────────────────────┬───────────────────────────────────┐
│          Variable          │            Descripción            │
├────────────────────────────┼───────────────────────────────────┤
│ POSTGRES_USER              │ Usuario de PostgreSQL             │
├────────────────────────────┼───────────────────────────────────┤
│ POSTGRES_PASSWORD          │ Contraseña de PostgreSQL          │
├────────────────────────────┼───────────────────────────────────┤
│ POSTGRES_DB                │ Nombre de la base de datos        │
├────────────────────────────┼───────────────────────────────────┤
│ REDIS_PASSWORD             │ Contraseña de Redis
├────────────────────────────┼───────────────────────────────────┤
│ VITE_CLERK_PUBLISHABLE_KEY │ Clave pública de Clerk (frontend) │
├────────────────────────────┼────────────────────────────────
│ CLERK_SECRET_KEY           │ Clave secreta de Clerk (backend)  │
└────────────────────────────┴───────────────────────────────────┘

▎  Nunca subas el archivo .env al repositorio. Está incluido en .gitignore.

---
Flujo de Ramas

feature/* ──► dev ──► qa ──► main

┌───────────┬─────────────────────────────────────────────────
│   Rama    │                       Propósito                        │
├───────────┼────────────────────────────────────────────────────────┤
│ feature/* │ Desarrollo de funcionalidades                          │
├───────────┼────────────────────────────────────────────────────────┤
│ dev       │ Integración continua del equipo                        │
├───────────┼─────────────────────────────────────────────────
│ qa        │ Ambiente de pruebas — deploy automático al hacer merge │
├───────────┼────────────────────────────────────────────────────────┤
│ main      │ Producción — requiere aprobación del Tech Lead
└───────────┴────────────────────────────────────────────────────────┘

Todo PR hacia qa o main requiere que pasen los siguientes chec

-  Backend — Build & Test (mvn clean verify)
-  Frontend — Build (npm run build)

---
---
Pipeline CI/CD

┌──────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────┐
│                    Evento                    │                                         Resultado                                         │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ Push a feature/* con cambios en backend      │ Build y tests del backend                                                                 │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ Push a feature/* con cambios en frontend web │ Lint y build del frontend                                                                 │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ PR hacia qa o main                           │ Verifica compilación de backend y frontend antes de permitir el merge                     │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ Merge a qa                                   │ Build de imágenes Docker → push a Docker Hub → deploy automático en QA                    │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ Merge a main                                 │ Build de imágenes Docker → push a Docker Hub → deploy en producción con aprobación manual │
└──────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────┘

---
Ambientes

┌────────────┬────────────┬─────────────────────────────┐
│  Ambiente  │    Rama    │       Tipo de deploy        │
├────────────┼────────────┼─────────────────────────────┤
│ Local      │ cualquiera │ Docker Compose local        │
├────────────┼────────────┼─────────────────────────────┤
│ QA         │ qa         │ AWS EC2 — automático        │
├────────────┼────────────┼─────────────────────────────┤
│ Producción │ main       │ AWS EC2 — aprobación manual │
└────────────┴────────────┴─────────────────────────────┘

---
Autores

┌────────────────────────────────┬────────────────┐
│             Nombre             │      Rol       │
├────────────────────────────────┼────────────────┤
│ Lenin David Alomoto Cevallos   │   Backend      │
├────────────────────────────────┼────────────────┤
│ Rodney Jhosue Andrade Chamorro │   DevOps       │
├────────────────────────────────┼────────────────┤
│ Kennet Steveen Rodriguez Lopez │   Frontend     │
├────────────────────────────────┼────────────────┤
│ Melany Vanessa Vela Loachamin  │  Scrum Master  │
└────────────────────────────────┴────────────────┘

---
Universidad Central del Ecuador — Programación Web

---
