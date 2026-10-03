# Plano de trabalho em andamento

Diferente do [dev.md](dev.md) (banco de ideias, sem compromisso), este arquivo acompanha só o que
está **de fato sendo planejado ou implementado agora**, organizado por Etapa — continuando a
numeração já usada no [README.md](README.md) e no [CHANGELOG.md](CHANGELOG.md) (Etapas 1 a 7,
concluídas antes deste arquivo existir).

Cada Etapa pode ter subitens fecháveis individualmente (ex.: 8.1, 8.2). Quando um subitem fecha:

1. O código é commitado.
2. Uma entrada é adicionada ao `CHANGELOG.md` (em `[Não lançado]` ou numa versão nova).
3. O subitem é marcado `[x]` aqui, com a data de fechamento.
4. Quando **todos** os subitens de uma Etapa fecham, a Etapa inteira é removida deste arquivo —
   o `CHANGELOG.md` passa a ser a única fonte de verdade sobre o que foi feito.

Status possíveis: `planejado` (ainda não começou) · `em andamento` · `concluído`.

---

## Etapa 8 — Segurança de login

Motivação: antes de qualquer outra coisa, fechar os buracos óbvios do fluxo de autenticação atual
(sem confirmação de e-mail, sem recuperação de senha) e garantir que toda conta tenha os dados da
instituição que representa antes de usar o sistema.

### 8.1 — Confirmação de e-mail no cadastro (Resend) — `concluído` (2026-10-03)

- [x] `User` ganha `emailVerifiedAt` (nullable); novo model para o código de verificação
      (código, expiração, tentativas).
- [x] Integração com Resend (`backend/src/services/email.service.js` ou similar) — envia o código
      no `POST /api/auth/register`.
- [x] `POST /api/auth/verify-email` (código → marca `emailVerifiedAt`) e endpoint para reenviar o
      código (com limite de reenvio).
- [x] `POST /api/auth/login` recusa login (`403 EMAIL_NOT_VERIFIED`) enquanto `emailVerifiedAt`
      for nulo.
- [x] Frontend: tela "confirme seu e-mail" logo após o registro; tratamento do erro
      `EMAIL_NOT_VERIFIED` na tela de login (redireciona para reenviar código).
- [x] Variáveis novas documentadas em `backend/.env.example` e `DEPLOY.md`
      (`RESEND_API_KEY`, remetente).

### 8.2 — Reset de senha — `concluído` (2026-10-03)

- [x] Novo model para token de reset (token, expiração, usado/não usado).
- [x] `POST /api/auth/forgot-password` (sempre responde sucesso, mesmo se o e-mail não existir —
      não revelar quais e-mails têm conta) envia o link/código por e-mail (reaproveita
      `email.service.js` do 8.1).
- [x] `POST /api/auth/reset-password` (token + nova senha).
- [x] Frontend: "esqueci minha senha" no login, tela de definir nova senha.

### 8.3 — Perfil obrigatório da instituição — `planejado`

- [ ] Novo model `InstitutionProfile` (ou campos no `User`), 1:1 com `User`: nome da instituição,
      endereço, contato, site.
- [ ] Middleware/checagem: enquanto o perfil não estiver completo, toda rota autenticada (exceto
      a própria rota de salvar o perfil e `/api/auth/me`) responde algo que o frontend reconhece
      para redirecionar à tela de configuração — decidir o código de erro/estrutura na hora do
      design técnico desta etapa.
- [ ] Frontend: tela de configuração obrigatória, exibida antes de qualquer outra tela quando o
      perfil estiver incompleto.

---
