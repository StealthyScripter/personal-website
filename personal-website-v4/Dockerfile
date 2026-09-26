# syntax=docker/dockerfile:1
FROM node:20.20.2-bookworm-slim
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
