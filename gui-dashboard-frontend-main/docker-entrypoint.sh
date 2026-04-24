#!/bin/sh

# Replace build-time placeholder with runtime env value
# Defaults to localhost:3500 if NEXT_PUBLIC_API_URL is not set
API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3500}

echo "Injecting runtime NEXT_PUBLIC_API_URL: $API_URL"

find /app/.next -type f \( -name "*.js" -o -name "*.json" \) -exec \
  sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|$API_URL|g" {} +

# Start Next.js standalone server
exec node server.js
