import { candidateRepository } from '../repositories/candidate.repository.js';
import { partyRepository } from '../repositories/party.repository.js';
import { personRepository } from '../repositories/person.repository.js';
import { positionRepository } from '../repositories/position.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import { voteRepository } from '../repositories/vote.repository.js';
import { CANDIDATE_STATUS } from '../rules/candidate-rules.js';
import { SESSION_STATUS } from '../rules/session-rules.js';
import { VOTE_TYPE } from '../rules/vote-rules.js';
import { badRequest, conflict, notFound } from '../utils/errors.js';
import { computeVoteHash } from '../utils/hash.js';
import { isPlainObject } from '../utils/object.js';

// ---------- validações de campo ----------

async function requireSession(sessionId, userId) {
  if (!sessionId) throw badRequest('VOTE_SESSION_REQUIRED', 'Informe a sessão da votação.');
  const session = await sessionRepository.findById(sessionId);
  if (!session || session.userId !== userId) throw badRequest('VOTE_SESSION_NOT_FOUND', 'Sessão não encontrada.');
  return session;
}

async function requirePositionRule(session, code, userId) {
  if (!code) throw badRequest('VOTE_POSITION_REQUIRED', 'Informe o cargo da votação.');
  const rule = await positionRepository.findByCode(code, userId);
  if (!rule) throw badRequest('VOTE_POSITION_INVALID', 'Cargo inválido.');
  if (!session.positions.includes(code)) {
    throw badRequest('VOTE_POSITION_NOT_ENABLED', 'Este cargo não está habilitado nesta sessão.');
  }
  return rule;
}

function requireSessionOpen(session) {
  if (session.status !== SESSION_STATUS.OPEN) {
    throw conflict('VOTE_SESSION_NOT_OPEN', 'A votação desta sessão não está aberta.');
  }
}

function requireType(type) {
  if (!Object.values(VOTE_TYPE).includes(type)) {
    throw badRequest('VOTE_TYPE_INVALID', 'Tipo de voto inválido. Use VALID, BLANK ou NULL.');
  }
}

function requireConfirmed(confirmed) {
  if (confirmed !== true) {
    throw badRequest('VOTE_NOT_CONFIRMED', 'Confirme o voto antes de registrar.');
  }
}

// Número digitado: aceita texto ou número, exige a quantidade de dígitos do cargo.
function normalizeTypedNumber(value, positionRule) {
  const number = typeof value === 'number' ? String(value) : value;
  if (typeof number !== 'string' || !/^\d+$/.test(number) || number.length !== positionRule.digits) {
    return null;
  }
  return number;
}

function requireTypedNumber(rawNumber, positionRule) {
  if (rawNumber === undefined || rawNumber === null || rawNumber === '') {
    throw badRequest('VOTE_NUMBER_REQUIRED', 'Informe o número do candidato.');
  }
  const number = normalizeTypedNumber(rawNumber, positionRule);
  if (!number) {
    throw badRequest(
      'VOTE_NUMBER_INVALID',
      `Para ${positionRule.label}, o número deve ter exatamente ${positionRule.digits} dígitos.`,
    );
  }
  return number;
}

// ---------- resposta enriquecida com o partido (lookup) ----------

const summarizeParty = (party) =>
  party ? { name: party.name, acronym: party.acronym, number: party.number } : null;

async function summarizeCandidate(candidate) {
  const [party, person] = await Promise.all([
    partyRepository.findById(candidate.partyId),
    personRepository.findById(candidate.personId),
  ]);
  return {
    id: candidate.id,
    name: person?.name ?? null,
    number: candidate.number,
    photo: person?.photo ?? null,
    position: candidate.position,
    party: summarizeParty(party),
  };
}

// ---------- resolução do voto por tipo ----------

async function resolveValid(session, position, positionRule, rawNumber) {
  const number = requireTypedNumber(rawNumber, positionRule);
  const candidate = await candidateRepository.findByBallotNumber(session.id, position, number);
  if (!candidate) throw notFound('CANDIDATE_NOT_FOUND', 'Nenhum candidato com este número.');
  if (candidate.status !== CANDIDATE_STATUS.ACTIVE) {
    throw conflict('CANDIDATE_INACTIVE', 'Este candidato está inativo e não recebe votos.');
  }
  return { candidateId: candidate.id, candidateNumber: candidate.number };
}

async function resolveNull(session, position, positionRule, rawNumber) {
  if (rawNumber === undefined || rawNumber === null || rawNumber === '') {
    return { candidateId: null, candidateNumber: null };
  }
  const number = normalizeTypedNumber(rawNumber, positionRule);
  if (!number) {
    throw badRequest(
      'VOTE_NUMBER_INVALID',
      `Para ${positionRule.label}, o número deve ter exatamente ${positionRule.digits} dígitos.`,
    );
  }
  // Se o número corresponde a um candidato existente, o voto nulo não carrega essa
  // escolha; se não corresponde a ninguém, guarda o número só para auditoria.
  const candidate = await candidateRepository.findByBallotNumber(session.id, position, number);
  return { candidateId: null, candidateNumber: candidate ? null : number };
}

async function resolveChoice(session, data, positionRule) {
  if (data.type === VOTE_TYPE.VALID) {
    return resolveValid(session, data.position, positionRule, data.number);
  }
  if (data.type === VOTE_TYPE.NULL) {
    return resolveNull(session, data.position, positionRule, data.number);
  }
  return { candidateId: null, candidateNumber: null };
}

// ---------- serviço ----------

export const voteService = {
  async lookup(query = {}, userId) {
    const session = await requireSession(query.sessionId, userId);
    const positionRule = await requirePositionRule(session, query.position, userId);
    const number = requireTypedNumber(query.number, positionRule);

    const candidate = await candidateRepository.findByBallotNumber(session.id, query.position, number);
    if (!candidate) return { status: 'NOT_FOUND' };
    if (candidate.status !== CANDIDATE_STATUS.ACTIVE) return { status: 'INACTIVE' };

    return { status: 'FOUND', candidate: await summarizeCandidate(candidate) };
  },

  async create(input, userId) {
    const data = isPlainObject(input) ? input : {};

    const session = await requireSession(data.sessionId, userId);
    const positionRule = await requirePositionRule(session, data.position, userId);
    requireSessionOpen(session);
    requireType(data.type);
    requireConfirmed(data.confirmed);

    const choice = await resolveChoice(session, data, positionRule);

    // Checa "sessão ainda OPEN" e grava o voto como uma única operação atômica,
    // usando o mesmo lock que session.service usa para finalizar. Assim, uma
    // finalização concorrente nunca deixa passar um voto depois de completada.
    // Como toda gravação de voto passa por este mesmo lock, ler "o último voto
    // desta sessão" aqui dentro também é seguro: nunca duas gravações concorrentes
    // calculam o previousHash a partir do mesmo voto anterior.
    const result = await sessionRepository.withLock(async ({ read }) => {
      const sessions = await read();
      const current = sessions.find((s) => s.id === session.id);
      if (!current || current.status !== SESSION_STATUS.OPEN) return { notOpen: true };

      const sessionVotes = await voteRepository.findWhere((v) => v.sessionId === session.id);
      const previousHash = sessionVotes.length > 0 ? sessionVotes[sessionVotes.length - 1].hash : null;

      const voteData = {
        sessionId: session.id,
        userId,
        position: data.position,
        candidateId: choice.candidateId,
        candidateNumber: choice.candidateNumber,
        type: data.type,
        createdAt: new Date().toISOString(),
      };
      const record = await voteRepository.create({
        ...voteData,
        hash: computeVoteHash(voteData, previousHash),
        previousHash,
      });
      return { record };
    });

    if (result.notOpen) {
      throw conflict('VOTE_SESSION_NOT_OPEN', 'A votação desta sessão não está aberta.');
    }
    return result.record;
  },
};
