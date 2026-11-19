# syntax=docker/dockerfile:1
FROM node:20.20.2-bookworm-slim AS development
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm rebuild esbuild
COPY --chown=node:node . .
ENV NODE_ENV=development
EXPOSE 5173
CMD ["node", "node_modules/vite/bin/vite.js", "--config", "vite.docker.config.mjs", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]

FROM development AS build
ENV NODE_ENV=production VITE_API_URL=https://admin.briankoringo.com
RUN npm run build

FROM caddy:2-alpine AS production
COPY --from=build /app/dist /srv
# The deployment archive is extracted with a restrictive umask.
COPY --chmod=0644 Caddyfile /etc/caddy/Caddyfile
USER 1000:1000
EXPOSE 8080
