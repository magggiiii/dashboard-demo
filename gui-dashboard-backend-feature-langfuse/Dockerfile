# Build Stage
FROM node:20-alpine AS builder

# Install build dependencies for bcrypt and other native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDeps for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy production node_modules and built dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Expose backend port
EXPOSE 3500

# Start the application
CMD ["node", "dist/main"]
