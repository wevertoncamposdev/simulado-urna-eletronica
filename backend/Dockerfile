FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Backend não tem dependências de terceiros (Node.js puro), mas copiamos o
# package.json antes do resto do código pra aproveitar o cache de camadas do Docker
# caso isso mude no futuro.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY src ./src

# Seed (scripts/seed.js, na raiz do repo) é uma ferramenta de desenvolvimento —
# não faz parte da imagem de produção. Rode-a localmente contra os dados de um
# volume, se precisar popular um ambiente novo.

# Dados ficam fora da imagem — monte um volume aqui (ver docker-compose.yml /
# Railway Volumes). Sem volume, tudo é perdido no próximo deploy.
RUN mkdir -p /app/data && chown -R node:node /app
VOLUME ["/app/data"]
ENV DATA_PATH=/app/data

# Imagem node:*-alpine já traz o usuário "node" (não-root) pronto pra uso.
USER node

EXPOSE 3000

CMD ["node", "src/server.js"]
