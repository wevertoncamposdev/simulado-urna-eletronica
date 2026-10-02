import { sessionRepository } from '../repositories/session.repository.js';
import { candidateRepository } from '../repositories/candidate.repository.js';
import { voteRepository } from '../repositories/vote.repository.js';
import { SESSION_LIMITS, SESSION_STATUS } from '../rules/session-rules.js';
import { POSITION_RULES, getPositionRule } from '../rules/position-rules.js';
import { badRequest, conflict, notFound } from '../utils/errors.js';
import { isPlainObject } from '../utils/object.js';

// Valida e normaliza os dados vindos da requisição. Lança o primeiro erro encontrado.
function normalizeInput(input) {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) {
    throw badRequest('SESSION_NAME_REQUIRED', 'Informe o nome da sessão.');
  }
  if (name.length > SESSION_LIMITS.nameMaxLength) {
    throw badRequest(
      'SESSION_NAME_TOO_LONG',
      `O nome pode ter no máximo ${SESSION_LIMITS.nameMaxLength} caracteres.`,
    );
  }

  if (input.year === undefined || input.year === null || input.year === '') {
    throw badRequest('SESSION_YEAR_REQUIRED', 'Informe o ano da sessão.');
  }
  const year = Number(input.year);
  if (!Number.isInteger(year) || year < SESSION_LIMITS.minYear || year > SESSION_LIMITS.maxYear) {
    throw badRequest(
      'SESSION_YEAR_INVALID',
      `O ano deve estar entre ${SESSION_LIMITS.minYear} e ${SESSION_LIMITS.maxYear}.`,
    );
  }

  if (!Array.isArray(input.positions) || input.positions.length === 0) {
    throw badRequest('SESSION_POSITIONS_REQUIRED', 'Selecione ao menos um cargo.');
  }
  const invalid = input.positions.filter((code) => !getPositionRule(code));
  if (invalid.length > 0) {
    throw badRequest('SESSION_POSITION_INVALID', `Cargo inválido: ${invalid.join(', ')}.`);
  }
  const positions = [...new Set(input.positions)].sort(
    (a, b) => POSITION_RULES[a].order - POSITION_RULES[b].order,
  );

  return { name, year, positions };
}

async function findOrFail(id) {
  const session = await sessionRepository.findById(id);
  if (!session) throw notFound('SESSION_NOT_FOUND', 'Sessão não encontrada.');
  return session;
}

// Acrescenta os totais que o dashboard e a tela de detalhes exibem.
async function withStats(session) {
  const [candidatesCount, votesCount] = await Promise.all([
    candidateRepository.countBySession(session.id),
    voteRepository.countBySession(session.id),
  ]);
  return { ...session, positionsCount: session.positions.length, candidatesCount, votesCount };
}

async function changeStatus(id, { from, to, timestampField, errorMessage }) {
  const session = await findOrFail(id);
  if (session.status !== from) {
    throw conflict('INVALID_SESSION_STATUS', errorMessage);
  }
  const updated = await sessionRepository.update(id, {
    status: to,
    [timestampField]: new Date().toISOString(),
  });
  return withStats(updated);
}

export const sessionService = {
  async list() {
    const sessions = await sessionRepository.findAll();
    sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return Promise.all(sessions.map(withStats));
  },

  async getById(id) {
    return withStats(await findOrFail(id));
  },

  async create(input) {
    const data = normalizeInput(isPlainObject(input) ? input : {});
    const session = await sessionRepository.create({
      ...data,
      status: SESSION_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
    });
    return withStats(session);
  },

  async update(id, input) {
    const current = await findOrFail(id);
    if (current.status !== SESSION_STATUS.DRAFT) {
      throw conflict('SESSION_NOT_EDITABLE', 'Só é possível editar sessões em rascunho.');
    }
    const changes = isPlainObject(input) ? input : {};
    const data = normalizeInput({
      name: current.name,
      year: current.year,
      positions: current.positions,
      ...changes,
    });
    return withStats(await sessionRepository.update(id, data));
  },

  open(id) {
    return changeStatus(id, {
      from: SESSION_STATUS.DRAFT,
      to: SESSION_STATUS.OPEN,
      timestampField: 'startedAt',
      errorMessage: 'Só é possível abrir a votação de uma sessão em rascunho.',
    });
  },

  finish(id) {
    return changeStatus(id, {
      from: SESSION_STATUS.OPEN,
      to: SESSION_STATUS.FINISHED,
      timestampField: 'finishedAt',
      errorMessage: 'Só é possível finalizar uma sessão com votação aberta.',
    });
  },
};
