# Base image
FROM node:20-slim AS base
RUN npm install -g pnpm

# Prune stage for web app
FROM base AS prune_web
WORKDIR /app
COPY . .
RUN pnpm install --prod
RUN pnpm --filter web... deploy build/web

# Prune stage for server app
FROM base AS prune_server
WORKDIR /app
COPY . .
RUN pnpm install --prod
RUN pnpm --filter server... deploy build/server

# Build stage
FROM base AS build
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm --filter web build
RUN pnpm --filter server build

# Runner stage for web app
FROM base AS runner_web
WORKDIR /app
COPY --from=prune_web /app/build/web .
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

# Runner stage for server app
FROM base AS runner_server
WORKDIR /app
COPY --from=prune_server /app/build/server .
COPY --from=build /app/apps/server/dist ./apps/server/dist
EXPOSE 3001
CMD ["node", "apps/server/dist/main.js"]
