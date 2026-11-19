# syntax=docker/dockerfile:1
FROM node:20.20.2-bookworm-slim AS development
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm rebuild esbuild
COPY --chown=node:node . .
ENV NODE_ENV=development NEXT_TELEMETRY_DISABLED=1 WATCHPACK_POLLING=1000
EXPOSE 3000
# Webpack's polling watcher handles Windows/Docker Desktop bind mounts reliably.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--webpack"]

FROM development AS build
ARG NEXT_PUBLIC_API_URL
ARG SITE_URL
ENV NODE_ENV=production
RUN test -n "$NEXT_PUBLIC_API_URL" && test -n "$SITE_URL" && npm run build

FROM node:20.20.2-bookworm-slim AS production
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 NEXT_TELEMETRY_DISABLED=1
USER node
EXPOSE 3000
CMD ["node", "server.js"]
