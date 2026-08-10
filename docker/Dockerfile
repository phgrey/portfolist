# Multi-stage production Dockerfile optimized for layer caching
# Stage 1: Install dependencies using package manifests only
FROM node:20-alpine AS deps
WORKDIR /app

# Copy dependency manifests first to maximize Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build source code
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
