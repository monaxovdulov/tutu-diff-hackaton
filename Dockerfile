FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --ignore-scripts --frozen-lockfile=false

FROM base AS frontend-build

COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src

RUN pnpm build

FROM base AS api

COPY tsconfig.json ./
COPY src ./src

ENV HOST=0.0.0.0
ENV PORT=8787

EXPOSE 8787

CMD ["pnpm", "exec", "tsx", "src/server/main.ts"]

FROM nginx:1.27-alpine AS web

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 80
