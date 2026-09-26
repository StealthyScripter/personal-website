# syntax=docker/dockerfile:1
FROM node:20.20.2-bookworm-slim
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package.json package-lock.json ./
# PostgreSQL is a separate service: skip the embedded-postgres helper's hydration.
# Native dependencies ship platform packages; esbuild still needs its setup step.
RUN npm ci --ignore-scripts && npm rebuild esbuild \
    && node --input-type=module -e "import sharp from 'sharp'; import {hash} from '@node-rs/argon2'; await sharp({create:{width:1,height:1,channels:3,background:'#000'}}).webp().toBuffer(); await hash('image-build-native-check');"
COPY --chown=node:node . .
RUN mkdir -p /app/.docker-verification
ENV NODE_ENV=development HOST=0.0.0.0 CHOKIDAR_USEPOLLING=true CHOKIDAR_INTERVAL=1000
EXPOSE 4000
CMD ["npm", "run", "dev"]
