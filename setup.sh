#!/bin/bash
set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 CopilotKit Dashboard Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check Prerequisites
echo -e "\n${BLUE}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed.${NC}"
    echo "Please install Docker Desktop from: https://docs.docker.com/get-started/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker found$(docker version --format ' (v{{.Server.Version}})' 2>/dev/null)${NC}"

if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed.${NC}"
    echo "Please install Docker Desktop from: https://docs.docker.com/get-started/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found$(docker compose version --format ' (v{{.version}})' 2>/dev/null)${NC}"

if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker daemon is not running.${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

# 2. Configuration
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🧠 AI Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f .env ]; then
    read -p "Configuration file (.env) already exists. Overwrite? (y/n) [n]: " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "Skipping configuration..."
    else
        cp .env.example .env
    fi
else
    cp .env.example .env
fi

# Ask for Groq API Key
echo -e "\nThe dashboard uses Groq for AI. You need a free API key."
echo "Get one at: https://console.groq.com/keys"

while [ -z "$GROQ_KEY" ]; do
    read -p "Enter your Groq API key: " GROQ_KEY
    if [ -z "$GROQ_KEY" ]; then
        echo -e "${RED}API key is required.${NC}"
    fi
done

# 3. Langfuse Configuration (Optional)
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  📊 AI Tracing (Langfuse) — Optional${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "Langfuse lets you trace and debug AI interactions."
echo "To set it up:"
echo "  1. Create a free account at https://cloud.langfuse.com"
echo "  2. Create a new project"
echo "  3. Go to Settings → API Keys → Create new"

read -p "Do you have Langfuse API keys? (y/n) [n]: " has_langfuse
if [[ $has_langfuse =~ ^[Yy]$ ]]; then
    read -p "Enter Langfuse Secret Key (sk-lf-...): " LF_SECRET
    read -p "Enter Langfuse Public Key (pk-lf-...): " LF_PUBLIC
fi

# 4. Advanced Configuration (Optional)
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
read -p "Configure advanced features? (OAuth, S3) (y/n) [n]: " advanced
if [[ $advanced =~ ^[Yy]$ ]]; then
    read -p "Google Client ID: " GOOGLE_ID
    read -p "Google Client Secret: " GOOGLE_SECRET
    read -p "AWS Access Key ID: " AWS_ID
    read -p "AWS Secret Access Key: " AWS_SECRET
    read -p "S3 Bucket Name: " S3_BUCKET
fi

# 5. Generate Random Secrets
echo -e "\n${BLUE}Generating secure secrets...${NC}"
JWT_SECRET=$(openssl rand -base64 32 | tr -d '/+=')
BIFROST_VIRTUAL_KEY="bk_$(openssl rand -hex 16)"

# 6. Apply Configuration
echo -e "${BLUE}Applying configuration to .env...${NC}"

# Function to update .env
update_env() {
    local key=$1
    local value=$2
    # Handle characters that might break sed
    local escaped_value=$(echo "$value" | sed 's/[&/\]/\\&/g')
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^$key=.*|$key=$escaped_value|" .env
    else
        sed -i "s|^$key=.*|$key=$escaped_value|" .env
    fi
}

update_env "BIFROST_API_KEY" "$BIFROST_VIRTUAL_KEY"
update_env "JWT_SECRET" "$JWT_SECRET"

if [ ! -z "$GROQ_KEY" ]; then
    # We'll also store the real key in .env for reference, though Bifrost uses config.json
    # Actually, let's keep it simple and have the script manage the Bifrost config
    mkdir -p bifrost-data
    cat > bifrost-data/config.json <<EOF
{
  "providers": [
    {
      "name": "groq",
      "apiKey": "$GROQ_KEY",
      "baseUrl": "https://api.groq.com/openai/v1"
    }
  ],
  "virtualKeys": [
    {
      "name": "default",
      "key": "$BIFROST_VIRTUAL_KEY",
      "provider": "groq"
    }
  ]
}
EOF
fi

if [ ! -z "$LF_SECRET" ]; then update_env "LANGFUSE_SECRET_KEY" "$LF_SECRET"; fi
if [ ! -z "$LF_PUBLIC" ]; then update_env "LANGFUSE_PUBLIC_KEY" "$LF_PUBLIC"; fi
if [ ! -z "$GOOGLE_ID" ]; then update_env "GOOGLE_CLIENT_ID" "$GOOGLE_ID"; fi
if [ ! -z "$GOOGLE_SECRET" ]; then update_env "GOOGLE_CLIENT_SECRET" "$GOOGLE_SECRET"; fi
if [ ! -z "$AWS_ID" ]; then update_env "AWS_ACCESS_KEY_ID" "$AWS_ID"; fi
if [ ! -z "$AWS_SECRET" ]; then update_env "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET"; fi
if [ ! -z "$S3_BUCKET" ]; then update_env "S3_BUCKET_NAME" "$S3_BUCKET"; fi

# 7. Launch
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

read -p "Start the dashboard now? (y/n) [y]: " start
if [[ $start =~ ^[Nn]$ ]]; then
    echo "Setup finished. Run 'docker compose up -d' to start later."
else
    echo -e "\n${BLUE}Starting services...${NC}"
    docker compose pull
    docker compose up -d
    
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  🎉 Dashboard is ready!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "  🌐 Dashboard:     http://localhost:3000"
    echo "  🔌 API:           http://localhost:3500"
    echo "  🧠 AI Gateway:    http://localhost:8080"
    echo -e "\n${BLUE}📝 Sign up with email/password to get started!${NC}"
fi
