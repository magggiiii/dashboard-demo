# ==============================================================================
# 🚀 CopilotKit Dashboard Installer (Windows)
# ==============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🚀 CopilotKit Dashboard Installer" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# --- 1. Prerequisite Checks ---
Write-Host "`nChecking prerequisites..." -ForegroundColor Blue

if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Docker is not installed. Please install Docker Desktop: https://docs.docker.com/desktop/install/windows/" -ForegroundColor Red
    exit
}
Write-Host "✓ Docker found" -ForegroundColor Green

if (!(Get-Command "docker compose" -ErrorAction SilentlyContinue)) {
    # Check if it's 'docker-compose' (old v1)
    if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Host "✗ Docker Compose is not installed." -ForegroundColor Red
        exit
    }
}
Write-Host "✓ Docker Compose found" -ForegroundColor Green

# --- 2. File Unpacking ---
Write-Host "`nPreparing deployment files..." -ForegroundColor Blue

$dcContent = @"
services:
  db:
    image: postgres:15-alpine
    container_name: dashboard-db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: \${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-postgres}
      POSTGRES_DB: \${DB_NAME:-copilotkit}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: always

  bifrost:
    image: maximhq/bifrost
    container_name: dashboard-bifrost
    ports:
      - "8081:8080"
    volumes:
      - ./bifrost-data:/app/data
    restart: always

  backend:
    image: ghcr.io/magggiiii/copilot-dashboard-backend:latest
    container_name: dashboard-backend
    ports:
      - "3500:3500"
    env_file:
      - .env
    environment:
      DB_HOST: db
      BIFROST_BASE_URL: http://bifrost:8080/v1
    depends_on:
      db:
        condition: service_healthy
      bifrost:
        condition: service_started
    restart: always

  frontend:
    image: ghcr.io/magggiiii/copilot-dashboard-frontend:latest
    container_name: dashboard-frontend
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
"@

$envContent = @"
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=copilotkit
JWT_SECRET=CHANGE_ME
BIFROST_BASE_URL=http://bifrost:8080/v1
BIFROST_API_KEY=CHANGE_ME
BIFROST_MODEL=groq/llama-3.3-70b-versatile
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3500
NODE_ENV=production
PORT=3500
LANGFUSE_BASE_URL=https://cloud.langfuse.com
ENABLE_DEBUG_LOGS=false
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=false
"@

if (!(Test-Path "docker-compose.yml")) {
    $dcContent | Out-File -FilePath "docker-compose.yml" -Encoding utf8
    Write-Host "✓ Created docker-compose.yml" -ForegroundColor Green
}

if (!(Test-Path ".env.example")) {
    $envContent | Out-File -FilePath ".env.example" -Encoding utf8
    Write-Host "✓ Created .env.example" -ForegroundColor Green
}

$configExists = $false
if (Test-Path ".env") {
    $ans = Read-Host "Configuration file (.env) already exists. Overwrite? (y/n) [n]"
    if ($ans -match "[Yy]") {
        Copy-Item ".env.example" ".env"
    } else {
        Write-Host "Skipping configuration..."
        $configExists = $true
    }
} else {
    Copy-Item ".env.example" ".env"
}

# --- 3. Configuration ---
if (!$configExists) {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "  🧠 AI Configuration" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue

    Write-Host "`nThe dashboard uses Groq for AI. Get a key at: https://console.groq.com/keys"
    
    $groqKey = ""
    while ($groqKey -eq "") {
        $groqKey = Read-Host "Enter your Groq API key"
        if ($groqKey -eq "") { Write-Host "API key is required." -ForegroundColor Red }
    }

    # Secrets
    Write-Host "`nGenerating secure secrets..." -ForegroundColor Blue
    $jwtSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 255) }))
    $bifrostKey = "bk_" + [System.Guid]::NewGuid().ToString("n").Substring(0,16)

    # Update .env
    $envData = Get-Content ".env"
    $envData = $envData -replace "^JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
    $envData = $envData -replace "^BIFROST_API_KEY=.*", "BIFROST_API_KEY=$bifrostKey"
    $envData | Out-File ".env" -Encoding utf8

    # Bifrost Config
    if (!(Test-Path "bifrost-data")) { New-Item -ItemType Directory -Path "bifrost-data" | Out-Null }
    $bifrostJson = @"
{
  "providers": {
    "groq": { "apiKey": "$groqKey", "baseUrl": "https://api.groq.com/openai/v1" }
  },
  "virtualKeys": [
    { "name": "default", "key": "$bifrostKey", "provider": "groq" }
  ]
}
"@
    $bifrostJson | Out-File "bifrost-data/config.json" -Encoding utf8
}

# --- 4. Launch ---
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  ✅ Ready to Launch!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

$start = Read-Host "Start the dashboard now? (y/n) [y]"
if ($start -match "[Nn]") {
    Write-Host "Setup finished. Run 'docker compose up -d' to start later."
} else {
    Write-Host "`nPulling pre-built images from GHCR..." -ForegroundColor Blue
    docker compose pull
    Write-Host "`nStarting services..." -ForegroundColor Blue
    docker compose up -d
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "  🎉 Dashboard is ready!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "  🌐 Dashboard:     http://localhost:3000"
    Write-Host "  🔌 API:           http://localhost:3500"
    Write-Host "  🧠 AI Gateway:    http://localhost:8081"

    Write-Host "`nShowing live logs (Press Ctrl+C to stop viewing logs, the dashboard will keep running):" -ForegroundColor Blue
    docker compose logs -f
}
