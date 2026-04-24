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

## 🛠️ Common Commands (Makefile)

If you have `make` installed, you can use these convenience commands:

- `make start` - Start all services in the background.
- `make stop` - Stop all services.
- `make logs` - View real-time logs from all services.
- `make restart` - Restart the stack.
- `make clean` - Stop services and delete ALL data (volumes).
- `make dev` - Build and start services from local source code.

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
