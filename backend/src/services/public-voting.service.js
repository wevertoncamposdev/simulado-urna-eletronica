import { positionRepository } from '../repositories/position.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import { notFound } from '../utils/errors.js';
import { resultService } from './result.service.js';
import { voteService } from './vote.service.js';

// O link público não tem login: o token é a própria autorização, e resolve
// pra sessão (e pra conta dona dela) sem precisar de userId na requisição.
async function requireSessionByToken(token) {
  const session = await sessionRepository.findByPublicToken(token);
  if (!session) throw notFound('SESSION_NOT_FOUND', 'Sessão não encontrada.');
  return session;
}

export const publicVotingService = {
  // Só o necessário pra desenhar a cédula — nada sobre partidos, outras
  // sessões ou qualquer coisa fora desta eleição específica.
  async getSession(token) {
    const session = await requireSessionByToken(token);
    const positions = await positionRepository.findAllForUser(session.userId);
    const positionByCode = new Map(positions.map((p) => [p.code, p]));

    return {
      name: session.name,
      year: session.year,
      status: session.status,
      positions: session.positions.map((code) => {
        const rule = positionByCode.get(code);
        return { code, label: rule?.label ?? code, digits: rule?.digits ?? 0 };
      }),
    };
  },

  async lookup(token, query) {
    const session = await requireSessionByToken(token);
    return voteService.lookup({ sessionId: session.id, position: query.position, number: query.number }, session.userId);
  },

  async createVote(token, body) {
    const session = await requireSessionByToken(token);
    return voteService.create(
      {
        sessionId: session.id,
        position: body.position,
        type: body.type,
        number: body.number,
        confirmed: body.confirmed,
      },
      session.userId,
    );
  },

  // Resultado fica disponível no mesmo link assim que a sessão é finalizada —
  // mesma apuração da tela autenticada, só resolvida pelo token em vez do id.
  async getResults(token) {
    const session = await requireSessionByToken(token);
    return resultService.getForSession(session);
  },
};
