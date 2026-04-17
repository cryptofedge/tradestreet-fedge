FROM node:20-alpine AS base
RUN npm install -g pnpm

# ---- BUILD STAGE ----
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
COPY apps/api/ apps/api/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @tradestreet/types build
RUN pnpm --filter @tradestreet/api build

# ---- PRODUCTION STAGE ----
FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/
COPY --from=builder /app/apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --prod

EXPOSE 3000

LABEL org.opencontainers.image.title="FEDGE 2.O API"
LABEL org.opencontainers.image.description="TradeStreet API by Rafael Fellito Rodriguez Jr. — Eclat Universe"
LABEL org.opencontainers.image.vendor="Eclat Universe"

CMD ["node", "apps/api/dist/server.js"]
