# FlowDesk

FlowDesk is a multi-tenant project & task management platform (Kanban-style boards, projects, cards, labels, comments, activity feed and notifications) built with a **Laravel 11** API backend and a **React + TypeScript** frontend.

- **Workspaces** with role-based membership (owner/admin/member) — full multi-tenancy at the workspace level
- **Projects → Boards → Columns → Cards** hierarchy, with drag-and-drop card movement between columns
- **Labels, assignees and comments** on cards
- **Activity log** and per-user **notifications** (e.g. when assigned to a card or mentioned in a comment)
- **Dashboard** endpoint with workspace-level stats
- Token-based auth via **Laravel Sanctum**
- Background jobs via a **Redis**-backed queue worker, plus a Laravel **scheduler**

## Tech stack

| Layer      | Stack                                                                 |
|------------|------------------------------------------------------------------------|
| Backend    | PHP 8.3, Laravel 11, Laravel Sanctum, PostgreSQL 16, Redis 7          |
| Frontend   | React 18, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, dnd-kit |
| Tooling    | Pint (PHP style), PHPUnit, ESLint, GitHub Actions CI                   |
| Infra      | Docker & Docker Compose                                                |

## Project structure

```
flowdesk/
├── backend/          # Laravel 11 API (PHP 8.3)
│   ├── app/           # Controllers, Models, Policies, Requests, Listeners...
│   ├── database/       # Migrations, factories, seeders
│   ├── routes/api.php  # /api/v1 routes
│   └── Dockerfile
├── frontend/          # React + TypeScript SPA (Vite)
│   ├── src/
│   │   ├── features/   # auth, workspaces, boards, cards, notifications
│   │   ├── components/
│   │   ├── lib/        # API client, schemas, query keys
│   │   └── stores/
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Prerequisites

Pick **one** of the two setups below:

### Option A — Docker (recommended, fastest, same steps on every OS)
- [Docker](https://www.docker.com/) and Docker Compose v2 (bundled with Docker Desktop on Windows/macOS, or `docker-compose-plugin` on Linux)

### Option B — Running natively (no Docker)
- PHP **8.3** with the `pdo_pgsql` extension, and [Composer 2](https://getcomposer.org/)
- **PostgreSQL 16** and **Redis 7** running locally (or reachable remotely)
- **Node.js 20** and npm

---

## Option A — Quick start with Docker Compose

This spins up Postgres, Redis, the Laravel API, a queue worker, a scheduler and the Vite frontend in one command. It works identically on Windows, macOS and Linux — only the terminal you open differs.

### Windows (PowerShell)

```powershell
git clone https://github.com/your-org/flowdesk.git
cd flowdesk
docker compose up --build
```

### Windows (Command Prompt / cmd.exe)

```bat
git clone https://github.com/your-org/flowdesk.git
cd flowdesk
docker compose up --build
```

> Using WSL2? Treat it as Linux and follow the Linux instructions below inside your WSL distro — it will generally perform better than running Docker Desktop against a Windows-side checkout.

### macOS (Terminal / zsh, the default shell since Catalina)

```zsh
git clone https://github.com/your-org/flowdesk.git
cd flowdesk
docker compose up --build
```

### macOS (bash, if you still use it)

```bash
git clone https://github.com/your-org/flowdesk.git
cd flowdesk
docker compose up --build
```

### Linux — bash / zsh

```bash
git clone https://github.com/your-org/flowdesk.git
cd flowdesk
docker compose up --build
```

### Linux — fish shell

```fish
git clone https://github.com/your-org/flowdesk.git
cd flowdesk
docker compose up --build
```

Once the containers are up:

| Service   | URL                              |
|-----------|-----------------------------------|
| Frontend  | http://localhost:5173             |
| API       | http://localhost:8000/api/v1      |
| Postgres  | localhost:5432 (`flowdesk`/`secret`) |
| Redis     | localhost:6379                    |

The backend container runs migrations automatically on boot, and seeds the database once on first start (tracked by a `.docker-seeded` marker file, gitignored). To run it in the background instead, append `-d`:

```bash
docker compose up --build -d
docker compose logs -f backend   # follow logs from a single service
docker compose down              # stop everything (add -v to also drop the Postgres volume)
```

---

## Option B — Running natively (without Docker)

The commands below are equivalent across shells; only how you **copy the env file** and **export variables** differs, so each OS/shell is called out where it matters.

### 1. Clone the repository

**Windows (PowerShell):**
```powershell
git clone https://github.com/your-org/flowdesk.git
cd flowdesk
```

**macOS / Linux (bash, zsh or fish):**
```bash
git clone https://github.com/your-org/flowdesk.git
cd flowdesk
```

### 2. Backend (Laravel API)

Make sure PostgreSQL and Redis are running locally first (via your OS package manager, e.g. `brew services start postgresql redis` on macOS, or `sudo systemctl start postgresql redis` on most Linux distros; on Windows, install them via WSL2 or use the Docker images standalone: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:16-alpine`).

**Windows (PowerShell):**
```powershell
cd backend
Copy-Item .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

**Windows (Command Prompt):**
```bat
cd backend
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

**macOS / Linux (bash or zsh):**
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

**Linux (fish shell):**
```fish
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

Edit `backend/.env` beforehand (or after copying) so `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` and `REDIS_HOST` match your local Postgres/Redis instance. The API will be available at `http://localhost:8000/api/v1`.

To process queued jobs (notifications, activity recording) and the scheduler, open two more terminal tabs/windows and run, from `backend/`:

```bash
php artisan queue:work redis --tries=2 --sleep=1
php artisan schedule:work
```
(same command on every OS/shell)

### 3. Frontend (React + Vite)

**Windows (PowerShell):**
```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev -- --host 0.0.0.0
```

**Windows (Command Prompt):**
```bat
cd frontend
copy .env.example .env
npm install
npm run dev -- --host 0.0.0.0
```

**macOS / Linux (bash or zsh):**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev -- --host 0.0.0.0
```

**Linux (fish shell):**
```fish
cd frontend
cp .env.example .env
npm install
npm run dev -- --host 0.0.0.0
```

The app will be served at `http://localhost:5173`, and `VITE_API_URL` in `frontend/.env` should point to `http://localhost:8000/api/v1` (default value already set in `.env.example`).

---

## Running tests & linters

**Backend (PHPUnit + Pint), any OS — run from `backend/`:**
```bash
composer test          # runs the PHPUnit test suite
vendor/bin/pint --test # checks code style without modifying files
vendor/bin/pint        # auto-fixes code style
```

**Frontend (ESLint + TypeScript build check), any OS — run from `frontend/`:**
```bash
npm run lint
npm run build   # runs `tsc --noEmit` then a production Vite build
```

Both suites also run automatically in CI on every push/PR to `main` (see `.github/workflows/ci.yml`).

## API overview

All endpoints are namespaced under `/api/v1` and (aside from register/login/password-reset) require a Sanctum bearer token. Highlights:

- `POST /register`, `POST /login`, `POST /logout`, `GET /user`
- `GET/POST/PUT/DELETE /workspaces`, `/workspaces/{workspace}/members`
- `GET/POST/PUT/DELETE /projects`, `/boards`, `/columns`, `/cards`
- `POST /cards/{card}/move` — reorder/move a card across columns
- `POST /cards/{card}/assignees`, `/cards/{card}/labels`, `/cards/{card}/comments`
- `GET /workspaces/{workspace}/activities`, `/workspaces/{workspace}/dashboard`
- `GET /notifications`, `POST /notifications/{id}/read`

See `backend/routes/api.php` for the full, authoritative route list.

## Troubleshooting

- **Port already in use (5432, 6379, 8000 or 5173):** stop the conflicting local service or change the published port in `docker-compose.yml` / your `.env` files.
- **`docker compose` not found:** on older installs the command is `docker-compose` (with a hyphen); on Linux install the `docker-compose-plugin` package.
- **Backend can't reach Postgres/Redis when running natively:** double-check `DB_HOST`/`REDIS_HOST` in `backend/.env` — they should be `127.0.0.1` when running outside Docker, not `postgres`/`redis` (those hostnames only resolve inside the Compose network).
- **Windows line-ending/permission issues with `entrypoint.sh`:** if you edit it on Windows outside of Docker, save it with LF line endings, or run everything through WSL2 instead.

## License

No license file is currently included in this repository — add one (e.g. MIT) before distributing or open-sourcing this project.
