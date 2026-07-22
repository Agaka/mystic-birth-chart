FROM node:22-bookworm-slim

WORKDIR /app

COPY worker/package.json worker/package-lock.json ./worker/
RUN cd worker && npm ci

COPY worker ./worker
COPY src/lib/natalSnapshot.ts ./src/lib/natalSnapshot.ts
COPY public/brand/mystic-astrolabe-seal-transparent.png ./public/brand/mystic-astrolabe-seal-transparent.png

WORKDIR /app/worker
ENV NODE_ENV=production

CMD ["npm", "run", "start"]
