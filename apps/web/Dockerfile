# Base Stage: 기본 설정 및 pnpm 설치
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# corepack을 활성화하여 pnpm 사용 준비
RUN corepack enable

# Prune Stage: 모노레포에서 'web'에 필요한 파일만 추출 (Lockfile 최적화)
FROM base AS builder
WORKDIR /app
# turbo가 전역 설치되어 있지 않을 수 있으므로 npx 또는 global install
RUN pnpm add -g turbo
COPY . .
# web 앱과 관련된 의존성만 추출하여 /app/out 폴더에 생성
RUN turbo prune --scope=web --docker

# Installer Stage: 의존성 설치 및 빌드
FROM base AS installer
WORKDIR /app

# Prune 단계에서 분류된 패키지 파일들 복사
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# 의존성 설치 (CI 환경이므로 frozen-lockfile 권장)
RUN pnpm install --frozen-lockfile

# Prune 단계에서 분류된 소스 코드 복사
COPY --from=builder /app/out/full/ .

# Next.js 빌드 실행
RUN pnpm turbo run build --filter=web...

# Runner Stage: 실제 실행 이미지 (최소 크기)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js는 기본적으로 3000번이지만, 3001번으로 설정
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# 보안을 위해 별도 유저 생성 및 사용
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 정적 파일 및 standalone 빌드 결과물 복사
COPY --from=installer /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3001

# Standalone 모드는 server.js로 실행
CMD ["node", "apps/web/server.js"]