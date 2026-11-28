# Portable multi-stage OCI container for `udayantu-api`
# Deployable to Google Cloud Run, GKE, AWS ECS, Azure Container Apps, or Docker Compose.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=4000

COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json drizzle.config.ts ./
COPY server ./server
COPY migrations ./migrations
COPY openapi ./openapi

RUN addgroup -S udayantu && adduser -S udayantu -G udayantu
USER udayantu

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/healthz || exit 1

CMD ["npx", "tsx", "server/apiServer.ts"]
