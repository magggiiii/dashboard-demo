# Colors for better output
$GREEN = "`e[0;32m"
$BLUE = "`e[0;34m"
$RED = "`e[0;31m"
$NC = "`e[0m"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  🚀 CopilotKit Dashboard Setup"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check Prerequisites
Write-Host "`n$BLUEChecking prerequisites...$NC"

if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "$RED✗ Docker is not installed.$NC"
    Write-Host "Please install Docker Desktop from: https://docs.docker.com/get-started/get-docker/"
    exit 1
}
Write-Host "$GREEN✓ Docker found$NC"

if (!(docker compose version 2>$null)) {
    Write-Host "$RED✗ Docker Compose is not installed.$NC"
    Write-Host "Please install Docker Desktop from: https://docs.docker.com/get-started/get-docker/"
    exit 1
}
Write-Host "$GREEN✓ Docker Compose found$NC"

# 2. Configuration
Write-Host "`n$BLUE━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
Write-Host "$BLUE  🧠 AI Configuration$NC"
Write-Host "$BLUE━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"

if (Test-Path .env) {
    $overwrite = Read-Host "Configuration file (.env) already exists. Overwrite? (y/n) [n]"
    if ($overwrite -notmatch "[Yy]") {
        Write-Host "Skipping configuration..."
    } else {
        Copy-Item .env.example .env -Force
    }
} else {
    Copy-Item .env.example .env
}

# Ask for Groq API Key
Write-Host "`nThe dashboard uses Groq for AI. You need a free API key."
Write-Host "Get one at: https://console.groq.com/keys"

$GROQ_KEY = ""
while ([string]::IsNullOrWhiteSpace($GROQ_KEY)) {
    $GROQ_KEY = Read-Host "Enter your Groq API key"
    if ([string]::IsNullOrWhiteSpace($GROQ_KEY)) {
        Write-Host "$REDAPI key is required.$NC"
    }
}

# 3. Langfuse Configuration (Optional)
Write-Host "`n$BLUE━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
Write-Host "$BLUE  📊 AI Tracing (Langfuse) — Optional$NC"
Write-Host "$BLUE━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"

Write-Host "Langfuse lets you trace and debug AI interactions."
Write-Host "To set it up:"
Write-Host "  1. Create a free account at https://cloud.langfuse.com"
Write-Host "  2. Create a new project"
Write-Host "  3. Go to Settings → API Keys → Create new"

$has_langfuse = Read-Host "Do you have Langfuse API keys? (y/n) [n]"
if ($has_langfuse -match "[Yy]") {
    $LF_SECRET = Read-Host "Enter Langfuse Secret Key (sk-lf-...)"
    $LF_PUBLIC = Read-Host "Enter Langfuse Public Key (pk-lf-...)"
}

# 4. Advanced Configuration (Optional)
Write-Host "`n$BLUE━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
$advanced = Read-Host "Configure advanced features? (OAuth, S3) (y/n) [n]"
if ($advanced -match "[Yy]") {
    $GOOGLE_ID = Read-Host "Google Client ID"
    $GOOGLE_SECRET = Read-Host "Google Client Secret"
    $AWS_ID = Read-Host "AWS Access Key ID"
    $AWS_SECRET = Read-Host "AWS Secret Access Key"
    $S3_BUCKET = Read-Host "S3 Bucket Name"
}

# 5. Generate Random Secrets
Write-Host "`n$BLUEGenerating secure secrets...$NC"
$bytes = New-Object Byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$JWT_SECRET = [Convert]::ToBase64String($bytes) -replace '[/+=]', ''
$BIFROST_VIRTUAL_KEY = "bk_" + [Guid]::NewGuid().ToString("n").Substring(0, 32)

# 6. Apply Configuration
Write-Host "$BLUEApplying configuration to .env...$NC"

function Update-Env($key, $value) {
    if ($value) {
        $content = Get-Content .env
        $escapedValue = $value -replace '[&/\\]', '\$&'
        $content = $content -replace "^$key=.*", "$key=$value"
        $content | Set-Content .env
    }
}

Update-Env "BIFROST_API_KEY" "$BIFROST_VIRTUAL_KEY"
Update-Env "JWT_SECRET" "$JWT_SECRET"

# Create Bifrost Config
if (! (Test-Path bifrost-data)) { New-Item -ItemType Directory -Path bifrost-data }
$bifrostConfig = @{
    providers = @(
        @{
            name = "groq"
            apiKey = $GROQ_KEY
            baseUrl = "https://api.groq.com/openai/v1"
        }
    )
    virtualKeys = @(
        @{
            name = "default"
            key = $BIFROST_VIRTUAL_KEY
            provider = "groq"
        }
    )
}
$bifrostConfig | ConvertTo-Json -Depth 10 | Set-Content bifrost-data/config.json

if ($LF_SECRET) { Update-Env "LANGFUSE_SECRET_KEY" "$LF_SECRET" }
if ($LF_PUBLIC) { Update-Env "LANGFUSE_PUBLIC_KEY" "$LF_PUBLIC" }
if ($GOOGLE_ID) { Update-Env "GOOGLE_CLIENT_ID" "$GOOGLE_ID" }
if ($GOOGLE_SECRET) { Update-Env "GOOGLE_CLIENT_SECRET" "$GOOGLE_SECRET" }
if ($AWS_ID) { Update-Env "AWS_ACCESS_KEY_ID" "$AWS_ID" }
if ($AWS_SECRET) { Update-Env "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET" }
if ($S3_BUCKET) { Update-Env "S3_BUCKET_NAME" "$S3_BUCKET" }

# 7. Launch
Write-Host "`n$GREEN━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
Write-Host "$GREEN  ✅ Setup Complete!$NC"
Write-Host "$GREEN━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"

$start = Read-Host "Start the dashboard now? (y/n) [y]"
if ($start -match "[Nn]") {
    Write-Host "Setup finished. Run 'docker compose up -d' to start later."
} else {
    Write-Host "`n$BLUEStarting services...$NC"
    docker compose pull
    docker compose up -d
    
    Write-Host "`n$GREEN━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
    Write-Host "$GREEN  🎉 Dashboard is ready!$NC"
    Write-Host "$GREEN━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
    Write-Host "  🌐 Dashboard:     http://localhost:3000"
    Write-Host "  🔌 API:           http://localhost:3500"
    Write-Host "  🧠 AI Gateway:    http://localhost:8080"
    Write-Host "`n$BLUEMessage: Sign up with email/password to get started!$NC"
}
