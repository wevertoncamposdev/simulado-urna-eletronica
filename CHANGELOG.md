# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa
[Versionamento Semântico](https://semver.org/lang/pt-BR/) (`MAJOR.MINOR.PATCH`): `MINOR` para
funcionalidade nova compatível, `PATCH` para correções, `MAJOR` reservado para quando o projeto
sair do estágio educacional/0.x. Enquanto estiver em `0.x`, cada `MINOR` pode incluir mudanças
incompatíveis sem aviso extra, como é comum nessa faixa de versão.

## [Não lançado]

## [0.8.0] — 2026-10-02

### Added

- **Contas e login**: cadastro (nome, e-mail, senha) e login com JWT (HS256 implementado à mão,
  sem biblioteca — `utils/jwt.js`), senha com hash `scrypt` nativo do Node (`utils/password.js`).
  Toda rota exige login por padrão (`/api/auth/register` e `/api/auth/login` são as únicas
  públicas, além de `/api/health`); o front guarda o token no `localStorage` e desloga sozinho se
  qualquer requisição voltar 401.
- **Multi-tenancy (isolamento lógico)**: toda coleção — cargos, partidos, pessoas, candidatos,
  sessões, votos — ganhou um `userId`, filtrado em todo repository e service. Uma conta nunca
  enxerga nem referencia dados de outra (tentar acessar por id direto responde 404, nunca 403 —
  não revela que existe). Cada conta nova já nasce com os 7 cargos padrão, prontos pra editar.
- Tela de **Login** e **Cadastro**, botão de sair no cabeçalho, e `npm run seed` atualizado para
  criar (ou reaproveitar) uma conta demo fixa antes de popular os dados.

### Fixed

- CORS não liberava o header `Authorization`, bloqueando toda requisição autenticada vinda do
  navegador (preflight falhava antes mesmo do login terminar).

## [0.7.0] — 2026-10-02

### Added

- **Criar sessão de 2º turno**: na tela de Resultados, quando algum cargo não teve maioria
  absoluta, um banner mostra quem vai disputar a segunda rodada com um botão "Criar sessão de 2º
  turno". Ele cria a nova sessão (rascunho, mesmo ano) já com a candidatura dos dois mais votados
  de cada cargo — mesma pessoa, partido e número, só o vínculo com a sessão é novo — faltando só
  abrir a votação.

## [0.6.0] — 2026-10-02

### Added

- **Dois turnos**: cargos majoritários agora têm a opção "Permite 2º turno" (tela de Cargos). Com
  ela ativada, a apuração só declara um vencedor se alguém passar de 50% dos votos válidos no 1º
  turno (maioria absoluta); senão, mostra os dois mais votados que disputariam a segunda rodada,
  em vez de eleger alguém. `Presidente` e `Governador` já vêm com a opção ativada por padrão.
  O simulador calcula a regra e indica quem iria ao 2º turno, mas não cria uma sessão de 2º turno
  automaticamente — isso continua como ideia em aberto no dev.md.
- **Linha do tempo do projeto** (`/linha-do-tempo`): página contando o que cada etapa — as 7
  originais e o que veio depois — construiu e o que ela ensina, pensada pra quem usar o repo como
  material de estudo.

## [0.5.0] — 2026-10-02

### Added

- **Menu lateral recolhível**: botão no cabeçalho (ícone de painel) esconde/mostra a sidebar,
  deixando a tela mais limpa — útil sobretudo na Votação. A preferência fica salva no navegador
  (`localStorage`) e persiste entre recarregamentos.

## [0.4.0] — 2026-10-02

### Added

- **Painel lateral do candidato**: foto, nome e partido do candidato localizado passaram para um
  painel maior ao lado do teclado, em vez de um avatar pequeno embutido no cartão de dígitos —
  mais fácil de enxergar à distância, como o monitor separado de uma urna real.
- **Votação pelo teclado físico**: dígitos 0-9 digitam o número, Backspace/Delete corrige (igual
  ao botão "Corrige"), Enter confirma o voto e também avança pro próximo eleitor na tela de "Voto
  computado".
- **Som de confirmação**: o "pili-pim" clássico toca ao fechar a cédula (todos os cargos
  confirmados), sintetizado no navegador via Web Audio — sem depender de nenhum arquivo de áudio.
- **Botão de tela cheia** na Votação: usa a API nativa de fullscreen do navegador, com o ícone
  trocando para "sair" automaticamente (inclusive ao sair pelo Esc).

## [0.3.0] — 2026-10-02

### Added

- **Cadastro de pessoas (Pessoas)**: nova entidade `people` (nome + foto), com tela própria de
  CRUD (`/pessoas`, `/api/people`) separada da candidatura. Uma pessoa só pode ser removida se
  não tiver nenhuma candidatura vinculada.

### Changed

- **Candidatura virou só o vínculo**: o formulário de "Candidatos" não cria mais nome/foto — ele
  só registra a candidatura de uma pessoa já cadastrada (sessão + cargo + partido + número).
  Editar nome/foto agora acontece exclusivamente em Pessoas, e o ajuste aparece em todas as
  sessões onde a pessoa é candidata. `personId` é imutável depois que a candidatura é criada.
- **Migração de dados existente**: candidatos cadastrados no formato antigo (nome/foto no próprio
  registro) foram convertidos para o novo modelo por `scripts/migrate-candidates-to-people.js`.

## [0.2.0] — 2026-10-02

### Added

- **Cadastro de cargos (Cargos)**: `POSITION_RULES` deixou de ser uma lista fixa em código e virou
  um registro com CRUD completo (`/api/positions`) — nome, dígitos do número de urna e ordem na
  cédula são livres, com o identificador interno (`code`) gerado automaticamente a partir do nome.
  Um cargo em uso por alguma sessão não pode ser removido. Isso abre o simulador para eleições
  fora do modelo brasileiro (sindicato, grêmio, condomínio, etc.). Nova página **Cargos** no menu.
- **Página "Sistema eleitoral brasileiro"**: conteúdo educacional explicando cargos, mandatos,
  poderes (Executivo/Legislativo), abrangência (federal/estadual/municipal), sistema majoritário
  vs. proporcional e a regra de turno único vs. dois turnos. Acessível pelo menu e linkada a partir
  de cada cargo na tela de votação ("Saiba mais sobre este cargo").

### Changed

- **Captura de foto por webcam**: antes de confirmar, agora é possível rever o quadro capturado e
  escolher "Usar foto" ou "Tirar outra" sem precisar pedir permissão da câmera de novo. A prévia ao
  vivo e a foto final ficam espelhadas (efeito selfie). Mensagens de erro específicas para
  permissão negada, câmera não encontrada ou câmera em uso por outro aplicativo.

### Fixed

- **Captura de foto por webcam**: corrigida a tela preta que aparecia ao religar a câmera depois do
  primeiro uso (o vídeo era conectado ao stream antes do elemento `<video>` existir no DOM).

## [0.1.0] — Etapas 1 a 7

Primeira versão funcional do simulador, construída em 7 etapas de estudo (arquitetura em camadas,
Node.js puro sem framework HTTP, persistência em JSON, depois React no frontend).

### Added

- **Arquitetura em camadas**: `HTTP → Routes → Controllers → Services → Repositories →
  JsonDatabase → arquivo JSON`, com roteador e servidor HTTP próprios (sem Express). Só o
  `JsonDatabase`/`database/index.js` conhece o armazenamento, isolando uma futura troca para
  SQLite/PostgreSQL nos repositories.
- **Persistência em JSON** (`backend/data/*.json`): fila de operações (uma por vez) e gravação
  atômica (arquivo temporário + rename), evitando corrupção por escritas simultâneas.
- **Sessões eleitorais**: CRUD com ciclo de vida `DRAFT → OPEN → FINISHED`; cada sessão define
  quais cargos estão em disputa.
- **Partidos**: CRUD com sigla e número únicos; desativação (não exclusão) preserva candidatos e
  votos já vinculados.
- **Candidatos**: CRUD vinculado a sessão + cargo + partido; número único por cargo dentro da
  sessão (inclusive entre inativos); número com a quantidade de dígitos do cargo; identidade
  (partido/cargo/número) travada depois que a votação abre — só nome, foto e status continuam
  editáveis; candidato inativo não recebe votos.
- **Foto do candidato por link ou webcam**: aceita um link `http(s)://`, uma captura da câmera do
  navegador (vira arquivo em `backend/data/photos/`, nunca fica base64 no JSON) ou o caminho já
  salvo; arquivo antigo é removido do disco ao trocar ou remover a foto.
- **Votação**: busca do candidato pelo número digitado (`/api/votes/lookup`) e registro de voto
  válido, branco ou nulo; sessão precisa estar `OPEN`; nenhum dado do eleitor é armazenado; votos
  não têm edição nem exclusão.
- **Resultados**: apuração por cargo disponível só depois que a sessão é finalizada — ranking de
  candidatos, percentual sobre votos válidos (brancos/nulos ficam de fora, como numa eleição real)
  e vencedor(es) (mais de um em caso de empate no primeiro lugar).
- **Auditoria**: cada voto grava um hash encadeado ao voto anterior da sessão (`utils/hash.js`);
  `/api/sessions/:id/audit` reconfere a cadeia inteira e aponta o primeiro ponto de quebra, se
  houver — detecta alteração, remoção ou reordenação de votos feita direto no arquivo.
- **Trava de concorrência**: checar "sessão está OPEN" e gravar o voto (ou finalizar a sessão)
  rodam como uma única operação atômica, então uma finalização concorrente nunca deixa passar um
  voto depois de completada.
- **Frontend React**: páginas de Dashboard, Sessões, Partidos, Candidatos, Votação, Resultados e
  Auditoria, com layout, navegação lateral e componentes de UI próprios (tabelas, diálogos,
  badges de status, estados vazio/erro/carregando).
- **Script de seed** (`npm run seed [-- --voters=N] [-- --finish]`): recria os dados com partidos,
  uma sessão e candidatos fictícios e, opcionalmente, simula eleitores votando.
