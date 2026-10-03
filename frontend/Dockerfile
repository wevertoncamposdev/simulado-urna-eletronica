# --- build ---------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# VITE_* é embutido no bundle em tempo de BUILD, não lido em runtime — por isso
# precisa chegar como build arg (no Railway: configure em Settings → Build →
# Build Arguments, com o mesmo nome) e não como variável de ambiente comum.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# --- serve -----------------------------------------------------------------
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# PORT=80 só é usado se a plataforma não injetar a variável (ex.: docker run local).
# A imagem base do nginx já roda docker-entrypoint.d/20-envsubst-on-templates.sh,
# que gera /etc/nginx/conf.d/default.conf a partir do template acima no start.
ENV PORT=80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
