# Simulador de Urna Eletrônica (educacional)

Projeto para estudar Node.js puro, HTTP, APIs REST, arquitetura em camadas, persistência e React.
**Não é uma urna eletrônica oficial** e não reproduz sistemas ou interfaces oficiais de votação.

## Arquitetura

    HTTP → Routes → Controllers → Services → Repositories → JsonDatabase → arquivo JSON

Só o `JsonDatabase` e o `database/index.js` conhecem o armazenamento. Trocar para SQLite/PostgreSQL
significa reescrever os repositories, sem tocar em controllers, services, routes ou frontend.

## Como executar

    npm run install:all
    npm run dev:backend     # http://localhost:3000  (teste: /api/health)
    npm run dev:frontend    # http://localhost:5173

Variáveis do backend: `PORT`, `HOST`, `DATA_PATH`, `FRONTEND_URL`. Frontend: `VITE_API_URL`.

## Armazenamento JSON

Cada coleção é um array em `backend/data/*.json`. As operações passam por uma fila (uma por vez)
e a gravação é atômica (arquivo temporário + rename), evitando sobrescritas simultâneas.

## API de sessões (Etapa 2)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | /api/positions | Cargos e regras (dígitos, ordem) |
| GET | /api/sessions | Lista sessões com totais (cargos, candidatos, votos) |
| GET | /api/sessions/:id | Detalhes de uma sessão |
| POST | /api/sessions | Cria sessão (status DRAFT) |
| PUT | /api/sessions/:id | Edita sessão (somente DRAFT) |
| POST | /api/sessions/:id/open | DRAFT → OPEN |
| POST | /api/sessions/:id/finish | OPEN → FINISHED |

Erros seguem `{ "success": false, "error": { "code", "message" } }`
(400 validação, 404 não encontrada, 409 transição/edição inválida).

## API de partidos e candidatos (Etapas 3 e 4)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | /api/parties?search=&status= | Lista partidos (com total de candidatos) |
| GET/POST | /api/parties, /api/parties/:id | Consulta e criação |
| PUT | /api/parties/:id | Edita (nome, sigla, número, status) |
| DELETE | /api/parties/:id | **Desativa** (não apaga) |
| GET | /api/candidates?sessionId=&position=&partyId=&status=&search= | Lista candidatos com o partido |
| GET/POST | /api/candidates, /api/candidates/:id | Consulta e criação (somente sessão em DRAFT) |
| PUT | /api/candidates/:id | Edita; com a votação aberta, só nome, foto e status |
| DELETE | /api/candidates/:id | **Desativa** (não apaga) |

Regras principais: número do partido (1–99) e sigla são únicos; o número do candidato tem a
quantidade de dígitos do cargo e é único por sessão + cargo (inclusive entre inativos);
candidato inativo não recebe votos. A unicidade é checada dentro da fila do `JsonDatabase`
(`insertUnless` / `updateUnless`), então cadastros simultâneos não geram duplicados.

### Foto do candidato: link ou webcam

O campo `photo` de `POST/PUT /api/candidates` aceita três formatos: um link `http(s)://`
(como antes), um data URI (`data:image/jpeg;base64,...`) capturado agora pela webcam do
navegador, ou um caminho já salvo (`/photos/...`, quando a edição reenvia a foto sem trocá-la).
Um data URI é decodificado e gravado em `backend/data/photos/<uuid>.<ext>` por
`storage/photo-storage.js` — o que fica salvo no candidato é só o caminho, nunca o base64, para
não inflar os arquivos JSON. O backend serve esses arquivos em `GET /photos/:arquivo`
(`middleware/photo-static.js`, sem depender de nenhum framework de arquivos estáticos; o nome do
arquivo é validado contra o formato exato gerado por `photoStorage.save`, então não há risco de
path traversal). Trocar ou remover a foto de um candidato apaga o arquivo antigo do disco depois
que a atualização é confirmada.

## API de votação (Etapa 5)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | /api/votes/lookup?sessionId=&position=&number= | Prévia do candidato na tela de votação |
| POST | /api/votes | Registra um voto (válido, branco ou nulo) |

`POST /api/votes` espera `{ sessionId, position, type, number?, confirmed }`, com
`type` ∈ `VALID` \| `BLANK` \| `NULL`. A sessão precisa estar `OPEN`; `confirmed` precisa ser
`true`. Em voto `VALID`, `number` é obrigatório e precisa ser de um candidato ativo da sessão e
cargo (senão `CANDIDATE_NOT_FOUND`/`CANDIDATE_INACTIVE`). Em voto `NULL`, o número é opcional e
só é gravado para auditoria quando não corresponde a nenhum candidato. Nada sobre o eleitor é
armazenado, e votos não têm update nem delete.

A checagem "sessão está `OPEN`" e a gravação do voto rodam como uma única operação atômica
(`sessionRepository.withLock`, usada também por `sessionService.finish`), então uma finalização
concorrente nunca deixa passar um voto depois de completada.

`npm run seed [-- --voters=N] [-- --finish]` (ou `node scripts/seed.js --voters=N --finish`)
recria `backend/data/*.json` com 3 partidos, uma sessão com 9 candidatos fictícios e,
opcionalmente, simula N eleitores votando (válido/branco/nulo, gerador de semente fixa) e
finaliza a sessão — usando os services, como qualquer outro cliente da API.

## API de resultados (Etapa 6)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | /api/sessions/:id/results | Apuração por cargo da sessão |

Assim como numa eleição real, a apuração só é publicada depois que a votação é finalizada
(`RESULTS_NOT_AVAILABLE`, 409, em sessões `DRAFT`/`OPEN`). Por cargo, devolve o ranking de
candidatos (nome, partido, votos e percentual sobre os votos válidos — brancos e nulos não
entram nessa conta, seguindo a convenção eleitoral), os totais (válidos/brancos/nulos) e o(s)
vencedor(es) (mais de um id em caso de empate no primeiro lugar).

## API de auditoria (Etapa 7)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | /api/sessions/:id/audit | Reconfere a cadeia de hashes dos votos da sessão |

Cada voto grava `hash` (sha256 do seu conteúdo + `previousHash`) e `previousHash` (o `hash` do
voto anterior da mesma sessão) — ver `utils/hash.js`. Como toda gravação de voto passa pelo mesmo
lock que `sessionService.finish` usa (`sessionRepository.withLock`), não há corrida possível entre
dois votos calculando o elo da cadeia ao mesmo tempo.

A auditoria (também só disponível com a sessão `FINISHED`, `AUDIT_NOT_AVAILABLE` caso contrário)
reconfere cada voto, na ordem em que foi gravado, contra dois critérios independentes:
`hashValid` (o hash bate com o conteúdo gravado) e `previousHashValid` (o `previousHash` aponta
para o `hash` do voto anterior). Isso detecta alteração de conteúdo, remoção e reordenação de
qualquer voto feita diretamente no arquivo JSON depois da gravação. A resposta inclui `valid`
(booleano geral) e `brokenAtIndex` (posição do primeiro voto onde a cadeia quebra, ou `null`).
