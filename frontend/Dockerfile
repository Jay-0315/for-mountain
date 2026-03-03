# ── Stage 1: deps ────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# standalone 내부 경로는 빌드 머신의 절대 경로를 포함함
# (로컬: Desktop/for-mountain/frontend/, CI: home/runner/work/...)
# server.js를 찾아서 /app/standalone-out/ 으로 평탄화
RUN SERVER_DIR=$(find /app/.next/standalone -name "server.js" -not -path "*/node_modules/*" -exec dirname {} \; | head -1) && \
    cp -r "$SERVER_DIR/." /app/standalone-out/

# ── Stage 3: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 빌드 결과물 복사 (경로 평탄화 완료)
COPY --from=builder --chown=nextjs:nodejs /app/standalone-out/ ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
