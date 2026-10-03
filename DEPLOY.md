# Deploy em produção (Railway)

O projeto sobe como **dois serviços Railway separados**, cada um a partir do seu
próprio `Dockerfile` — não existe backend/frontend num único container.

    backend/   → Dockerfile  (Node 20, API HTTP pura, porta via $PORT)
    frontend/  → Dockerfile  (build Vite + nginx, porta via $PORT)

## 1. Backend

1. New Service → Deploy from GitHub repo → **Root Directory: `backend`**. O Railway
   detecta o `backend/Dockerfile` e o `backend/railway.json` automaticamente.
2. Variáveis de ambiente (Settings → Variables):

   | Nome | Valor | Obrigatório |
   | --- | --- | --- |
   | `JWT_SECRET` | string aleatória forte (ex.: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) | **sim** — o servidor não inicia sem ele em produção |
   | `FRONTEND_URL` | URL pública do serviço frontend (ex.: `https://urna-frontend.up.railway.app`) | sim, senão o CORS bloqueia o navegador |
   | `DATA_PATH` | `/app/data` | sim, ver volume abaixo |
   | `NODE_ENV` | `production` | já vem assim do Dockerfile; não precisa repetir |

   `PORT` e `HOST` **não devem ser definidos manualmente** — o Railway injeta `PORT`
   e o backend já escuta em `0.0.0.0` automaticamente quando `NODE_ENV=production`.

3. **Volume persistente** (essencial): Settings → Volumes → Add Volume, monte em
   `/app/data`. Sem isso, cada deploy novo apaga todos os dados (sessões, votos,
   fotos) porque o filesystem do container é efêmero.
4. Health check já configurado em `backend/railway.json` (`/api/health`).

## 2. Frontend

1. New Service → Deploy from GitHub repo → **Root Directory: `frontend`**.
2. Build Argument (Settings → Build → Build Arguments — **não** em Variables, pois
   `VITE_API_URL` é embutido no bundle em tempo de build, não lido em runtime):

   | Nome | Valor |
   | --- | --- |
   | `VITE_API_URL` | URL pública do serviço backend (ex.: `https://urna-backend.up.railway.app`) |

3. Nenhuma variável de ambiente é necessária em runtime — é um nginx servindo
   arquivos estáticos. `PORT` é injetado pelo Railway e o nginx escuta nele
   automaticamente (`nginx.conf.template` + `envsubst`).

## 3. Ordem de deploy

Suba o **backend primeiro**, copie a URL pública gerada, configure-a como
`VITE_API_URL` no build do frontend e faça o deploy do frontend. Se trocar a URL do
backend depois, é preciso **rebuildar o frontend** (não só reiniciar) — a variável
está embutida no bundle.

## 4. Testando localmente antes de subir

    docker compose up --build
    # backend:  http://localhost:3000/api/health
    # frontend: http://localhost:8080

Isso usa os mesmos `Dockerfile`s do Railway, então um build que funciona aqui tem
boa chance de funcionar lá. Ver `docker-compose.yml` para os valores de exemplo
(troque `JWT_SECRET` antes de usar fora de teste local).

## 5. Checklist de segurança antes de ir ao ar

- [ ] `JWT_SECRET` é um valor aleatório gerado para produção, não o padrão de dev.
- [ ] `FRONTEND_URL` aponta exatamente para a URL pública do frontend (sem isso,
      toda chamada do navegador é bloqueada por CORS).
- [ ] Volume montado em `/app/data` no backend (confirme com um redeploy de teste:
      os dados devem continuar lá depois).
- [ ] HTTPS: o Railway já serve cada serviço com TLS por padrão no domínio
      `*.up.railway.app` — se usar domínio próprio, configure o certificado nas
      configurações de domínio do serviço.
- [ ] `backend/.env` e `frontend/.env` **nunca** são commitados (já cobertos pelo
      `.gitignore`); só os `.env.example` entram no repositório.
