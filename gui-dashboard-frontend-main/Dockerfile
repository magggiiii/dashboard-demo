# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set placeholders for runtime environment variables
ENV NEXT_PUBLIC_API_URL=__NEXT_PUBLIC_API_URL_PLACEHOLDER__
ENV NEXT_PUBLIC_ENABLE_DEBUG_LOGS=false

# Build Next.js app in standalone mode
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone build, static assets, and public files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

# Use entrypoint script for runtime env injection
ENTRYPOINT ["/docker-entrypoint.sh"]
