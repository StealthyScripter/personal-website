# syntax=docker/dockerfile:1
FROM node:20.20.2-bookworm-slim
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm rebuild esbuild
COPY --chown=node:node . .
ENV NODE_ENV=development
EXPOSE 5173
CMD ["node", "node_modules/vite/bin/vite.js", "--config", "vite.docker.config.mjs", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
