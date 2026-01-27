# Base Stage
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache openssl libc6-compat

# Prune Stage
FROM base AS builder
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune --scope=server --docker

# Installer & Build Stage
FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# 모든 의존성 설치 (devDependencies 포함, postinstall 스크립트는 스킵)
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=builder /app/out/full/ .

# Prisma Client 생성
# RUN cd apps/server && npx prisma generate
WORKDIR /app/apps/server
RUN npx prisma generate
WORKDIR /app

# NestJS 빌드
RUN pnpm turbo run build --filter=server...

# ---- prune 제거 ----
# RUN pnpm prune --prod

# Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# 1. 루트의 node_modules 복사 (여기에 .pnpm 폴더 등 실제 데이터가 있음)
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules

# 2. 서버 앱의 node_modules도 복사 (심볼릭 링크 보존을 위해)
COPY --from=installer --chown=nestjs:nodejs /app/apps/server/node_modules ./apps/server/node_modules

# 3. 나머지 파일 복사
COPY --from=installer --chown=nestjs:nodejs /app/apps/server/dist ./apps/server/dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/server/prisma ./apps/server/prisma
COPY --from=installer --chown=nestjs:nodejs /app/apps/server/package.json ./apps/server/package.json

USER nestjs

EXPOSE 3000

# 실행 경로를 앱 폴더 기준으로 변경하거나, 앱 폴더 내부에서 실행
WORKDIR /app/apps/server
CMD ["node", "dist/src/main.js"]