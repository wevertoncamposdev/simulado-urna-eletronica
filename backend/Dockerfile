FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Prisma (motor de query) precisa de OpenSSL no Alpine.
RUN apk add --no-cache openssl

# package.json + prisma/ antes do `npm ci` de propósito: o hook `postinstall`
# (prisma generate) já roda durante o próprio `npm ci` e precisa do schema
# presente nesse momento. Copiar `src` só depois também aproveita melhor o
# cache do Docker (mudar código não invalida a camada de install).
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY src ./src

# Fotos de candidatos continuam em arquivo (o resto dos dados foi para o
# Postgres via Prisma). Sem instrução VOLUME aqui de propósito — o Railway
# rejeita o build com ela (usa Railway Volumes, configurado no dashboard do
# serviço, não no Dockerfile); localmente o docker-compose.yml já declara o
# volume. Sem montar um volume de verdade em /app/data (Railway Volumes ou
# docker-compose), as fotos somem a cada deploy/recriação do container.
RUN mkdir -p /app/data && chown -R node:node /app
ENV DATA_PATH=/app/data

# Imagem node:*-alpine já traz o usuário "node" (não-root) pronto pra uso.
USER node

EXPOSE 3000

# `migrate deploy` só aplica migrações pendentes (idempotente) — seguro rodar
# em todo start do container, antes de abrir a porta.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
