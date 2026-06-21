# Frontend multi-stage build for agrograte-ai
# Stage 1: Build the Next.js app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lockfile first for better caching
COPY package.json package-lock.json ./
RUN npm ci --only=prod && npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production runner (slim)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy built assets and runtime dependencies only
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js || true

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })" || exit 1

CMD ["node_modules/.bin/next", "start", "-p", "3000"]
