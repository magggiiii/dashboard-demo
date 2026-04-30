# CopilotKit AI Dashboard

A powerful, agentic AI dashboard built with NestJS, Next.js, and CopilotKit.

## 🚀 Quick Start (One-Command Deployment)

Deploy the entire stack (Database, AI Gateway, Backend, and Frontend) instantly:

### Mac & Linux
```bash
curl -sSL https://raw.githubusercontent.com/magggiiii/dashboard-demo/main/install.sh | bash
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/magggiiii/dashboard-demo/main/setup.ps1 | iex
```

**What this does:**
1. Checks for Docker installation.
2. Creates the necessary configuration files.
3. Asks for your **Groq API Key**.
4. Pulls the latest multi-platform images (Intel, AMD, or Apple Silicon).
5. Starts the Dashboard, API, and AI Gateway.

---

### Manual Setup (Alternative)
If you have already cloned the repository:
```bash
# Mac or Linux
./install.sh

# Windows (PowerShell)
.\setup.ps1
```

### Accessing the Services

Once started, you can access the following:

- **🌐 Dashboard:** [http://localhost:3000](http://localhost:3000)
- **🔌 API:** [http://localhost:3500](http://localhost:3500)
- **🧠 AI Gateway (Bifrost):** [http://localhost:8080](http://localhost:8080)
- **📊 AI Tracing (Langfuse Cloud):** [https://cloud.langfuse.com](https://cloud.langfuse.com)

## 🧭 Local Development (Canonical Contributor Flow)

Use this as the default path when developing code in this repository.

### Recommended: Build from local source (hot code iteration)

```bash
# 1) Create local env file from the root template
cp .env.example .env

# 2) Start everything from source (frontend + backend + db + bifrost)
docker compose -f docker-compose.dev.yml up --build
```

This mode builds:
- `./gui-dashboard-backend-feature-langfuse`
- `./gui-dashboard-frontend-main`

### Alternative: Run prebuilt GHCR images

Use this when you only want to run the stack, not edit/build app code locally.

```bash
cp .env.example .env
docker compose up -d
```

Important:
- `docker-compose.dev.yml` = local source build workflow (recommended for contributors)
- `docker-compose.yml` = prebuilt image workflow
- Avoid mixing both modes in the same session to prevent container/project confusion

## 🛠️ Common Commands (Makefile)

If you have `make` installed, you can use these convenience commands:

- `make start` - Start all services in the background.
- `make stop` - Stop all services.
- `make logs` - View real-time logs from all services.
- `make restart` - Restart the stack.
- `make clean` - Stop services and delete ALL data (volumes).
- `make dev` - Build and start services from local source code.
- `make lint` - Run frontend + backend lint checks.
- `make test` - Run backend test suite.
- `make build` - Build frontend + backend.
- `make check` - Run lint + test + build (full quality gate).

## 📁 Project Structure

- `gui-dashboard-backend-feature-langfuse/` - NestJS Backend API.
- `gui-dashboard-frontend-main/` - Next.js Dashboard UI.
- `bifrost-data/` - Configuration and logs for the AI Gateway.
- `.env` - Your environment configuration (created by setup).

## 📊 AI Tracing (Optional)

To enable deep tracing of your AI interactions:
1. Create a free account at [Langfuse Cloud](https://cloud.langfuse.com).
2. Create a project and generate API keys (Secret Key and Public Key).
3. Add these keys to your `.env` file or provide them during `./setup.sh`.
4. Restart the backend: `make restart`.

## 📦 Image Distribution

Images are automatically built and pushed to **GitHub Container Registry (GHCR)** via GitHub Actions.

- Backend: `ghcr.io/magggiiii/copilot-dashboard-backend:latest`
- Frontend: `ghcr.io/magggiiii/copilot-dashboard-frontend:latest`
