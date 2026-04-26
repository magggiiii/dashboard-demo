#!/bin/bash
# ==============================================================================
# 🚀 CopilotKit Dashboard Installer
# ==============================================================================
set -e

# --- 1. Colors & Functions ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

update_env() {
    local key=$1
    local value=$2
    local escaped_value=$(echo "$value" | sed 's/[&/\]/\\&/g')
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^$key=.*|$key=$escaped_value|" .env
    else
        sed -i "s|^$key=.*|$key=$escaped_value|" .env
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 CopilotKit Dashboard Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- 2. Embedded Configuration Files ---

read -r -d '' DOCKER_COMPOSE_CONTENT << 'EOF' || true
services:
  db:
    image: postgres:15-alpine
    container_name: dashboard-db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-copilotkit}
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
      - "8080:8080"
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
      PORT: 3500
      DB_HOST: db
      BIFROST_BASE_URL: http://bifrost:8080/v1
    depends_on:
      db:
        condition: service_healthy
      bifrost:
        condition: service_started
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3500/ || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  frontend:
    image: ghcr.io/magggiiii/copilot-dashboard-frontend:latest
    container_name: dashboard-frontend
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      PORT: 3000
      HOSTNAME: 0.0.0.0
    depends_on:
      backend:
        condition: service_healthy
    restart: always

volumes:
  postgres_data:
EOF

read -r -d '' ENV_EXAMPLE_CONTENT << 'EOF' || true
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
BACKEND_INTERNAL_PORT=3500
LANGFUSE_BASE_URL=https://cloud.langfuse.com
ENABLE_DEBUG_LOGS=false
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=false
EOF

# --- 3. Port Cleanup & Prerequisite Checks ---
echo -e "\n${BLUE}Cleaning up port conflicts...${NC}"

kill_port() {
    local port=$1
    local pid=$(lsof -t -i :$port)
    if [ -n "$pid" ]; then
        echo -e "${BLUE}Stopping process on port $port (PID: $pid)...${NC}"
        kill -9 $pid 2>/dev/null || true
    fi
}

kill_port 3000
kill_port 3500
kill_port 8080

echo -e "\n${BLUE}Checking prerequisites...${NC}"

if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}✗ Docker Compose is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# --- 4. File Unpacking ---
echo -e "\n${BLUE}Preparing deployment files...${NC}"

if [ ! -f docker-compose.yml ]; then
    echo "$DOCKER_COMPOSE_CONTENT" > docker-compose.yml
    echo -e "${GREEN}✓ Created docker-compose.yml${NC}"
fi

if [ ! -f .env.example ]; then
    echo "$ENV_EXAMPLE_CONTENT" > .env.example
    echo -e "${GREEN}✓ Created .env.example${NC}"
fi

if [ -f .env ]; then
    echo -n "Configuration file (.env) already exists. Overwrite? (y/n) [n]: "
    read overwrite < /dev/tty
    case "$overwrite" in
        [Yy]*) cp .env.example .env ;;
        *) echo "Skipping configuration..."; CONFIG_EXISTS=true ;;
    esac
else
    cp .env.example .env
fi

# --- 5. Interactive Configuration ---
if [ "$CONFIG_EXISTS" != "true" ]; then
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  🧠 AI Configuration${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    echo -e "\nThe dashboard uses Groq for AI. Get a key at: https://console.groq.com/keys"
    
    GROQ_KEY=""
    while [ -z "$GROQ_KEY" ]; do
        echo -n "Enter your Groq API key: "
        read GROQ_KEY < /dev/tty
        if [ -z "$GROQ_KEY" ]; then echo -e "${RED}API key is required.${NC}"; fi
    done

    # Langfuse
    echo -e "\n${BLUE}📊 AI Tracing (Langfuse) — Optional${NC}"
    echo -n "Do you have Langfuse API keys? (y/n) [n]: "
    read has_lf < /dev/tty
    if [ "$has_lf" = "y" ] || [ "$has_lf" = "Y" ]; then
        echo -n "Enter Langfuse Secret Key: "
        read LF_SECRET < /dev/tty
        echo -n "Enter Langfuse Public Key: "
        read LF_PUBLIC < /dev/tty
    fi

    # S3
    echo -e "\n${BLUE}📦 File Storage (AWS S3) — Optional${NC}"
    echo -n "Do you want to configure S3 for file uploads? (y/n) [n]: "
    read has_s3 < /dev/tty
    if [ "$has_s3" = "y" ] || [ "$has_s3" = "Y" ]; then
        echo -n "Enter AWS Access Key ID: "
        read AWS_ID < /dev/tty
        echo -n "Enter AWS Secret Access Key: "
        read AWS_SECRET < /dev/tty
        echo -n "Enter S3 Bucket Name: "
        read S3_BUCKET < /dev/tty
    fi

    # Secrets
    echo -e "\n${BLUE}Generating secure secrets...${NC}"
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '/+=')
    BIFROST_VIRTUAL_KEY="bk_$(openssl rand -hex 16)"

    update_env "BIFROST_API_KEY" "$BIFROST_VIRTUAL_KEY"
    update_env "JWT_SECRET" "$JWT_SECRET"
    if [ -n "$LF_SECRET" ]; then update_env "LANGFUSE_SECRET_KEY" "$LF_SECRET"; fi
    if [ -n "$LF_PUBLIC" ]; then update_env "LANGFUSE_PUBLIC_KEY" "$LF_PUBLIC"; fi
    if [ -n "$AWS_ID" ]; then update_env "AWS_ACCESS_KEY_ID" "$AWS_ID"; fi
    if [ -n "$AWS_SECRET" ]; then update_env "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET"; fi
    if [ -n "$S3_BUCKET" ]; then update_env "S3_BUCKET_NAME" "$S3_BUCKET"; fi

    mkdir -p bifrost-data
    cat > bifrost-data/config.json <<EOF
{
  "providers": {
    "groq": {
      "keys": [{ "value": "$GROQ_KEY" }]
    }
  }
}
EOF
fi

# --- 6. Final Launch ---
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Ready to Launch!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Start the dashboard now? (y/n) [y]: "
read start < /dev/tty

if [ "$start" = "n" ] || [ "$start" = "N" ]; then
    echo "Setup finished. Run 'docker compose -p dashboard-demo up -d' to start later."
else
    echo -e "\n${BLUE}Pulling pre-built images from GHCR...${NC}"
    docker compose -p dashboard-demo pull
    echo -e "\n${BLUE}Starting services...${NC}"
    docker compose -p dashboard-demo up -d
    
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  🎉 Dashboard is ready!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "  🌐 Dashboard:     http://localhost:3000"
    echo "  🔌 API:           http://localhost:3500"
    echo "  🧠 AI Gateway:    http://localhost:8080"
    echo -e "\n${BLUE}Showing live logs (Press Ctrl+C to stop viewing logs, the dashboard will keep running):${NC}\n"
    docker compose -p dashboard-demo logs -f
fi
