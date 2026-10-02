import { candidateRepository } from '../repositories/candidate.repository.js';
import { partyRepository } from '../repositories/party.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import { voteRepository } from '../repositories/vote.repository.js';
import { POSITION_RULES } from '../rules/position-rules.js';
import { SESSION_STATUS } from '../rules/session-rules.js';
import { VOTE_TYPE } from '../rules/vote-rules.js';
import { conflict, notFound } from '../utils/errors.js';

async function findSessionOrFail(id) {
  const session = await sessionRepository.findById(id);
  if (!session) throw notFound('SESSION_NOT_FOUND', 'Sessão não encontrada.');
  return session;
}

// Como numa eleição real, a apuração só é publicada depois que a votação fecha.
function requireFinished(session) {
  if (session.status !== SESSION_STATUS.FINISHED) {
    throw conflict(
      'RESULTS_NOT_AVAILABLE',
      'Os resultados só ficam disponíveis depois que a eleição é finalizada.',
    );
  }
}

const summarizeParty = (party) =>
  party ? { name: party.name, acronym: party.acronym, number: party.number } : null;

const percent = (count, base) => (base > 0 ? (count / base) * 100 : 0);

// Apura um cargo: ranking de candidatos (só entre votos válidos) e totais de votos
// válidos/brancos/nulos. Empate no primeiro lugar faz todos os empatados vencerem.
function tallyPosition(code, votes, candidates, partiesById) {
  const positionVotes = votes.filter((v) => v.position === code);
  const totalVotes = positionVotes.length;
  const blankVotes = positionVotes.filter((v) => v.type === VOTE_TYPE.BLANK).length;
  const nullVotes = positionVotes.filter((v) => v.type === VOTE_TYPE.NULL).length;
  const validVotes = totalVotes - blankVotes - nullVotes;

  const countByCandidate = new Map();
  positionVotes
    .filter((v) => v.type === VOTE_TYPE.VALID && v.candidateId)
    .forEach((v) => countByCandidate.set(v.candidateId, (countByCandidate.get(v.candidateId) ?? 0) + 1));

  const ranked = candidates
    .filter((c) => c.position === code)
    .map((c) => {
      const candidateVotes = countByCandidate.get(c.id) ?? 0;
      return {
        id: c.id,
        name: c.name,
        number: c.number,
        photo: c.photo,
        status: c.status,
        party: summarizeParty(partiesById.get(c.partyId)),
        votes: candidateVotes,
        percentValid: percent(candidateVotes, validVotes),
      };
    })
    .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, 'pt-BR'));

  const topVotes = ranked[0]?.votes ?? 0;
  const winners = topVotes > 0 ? ranked.filter((c) => c.votes === topVotes).map((c) => c.id) : [];

  return {
    code,
    label: POSITION_RULES[code].label,
    digits: POSITION_RULES[code].digits,
    totals: {
      totalVotes,
      validVotes,
      blankVotes,
      nullVotes,
      blankPercent: percent(blankVotes, totalVotes),
      nullPercent: percent(nullVotes, totalVotes),
    },
    candidates: ranked,
    winners,
  };
}

export const resultService = {
  async getBySession(id) {
    const session = await findSessionOrFail(id);
    requireFinished(session);

    const [votes, candidates, parties] = await Promise.all([
      voteRepository.findWhere((v) => v.sessionId === id),
      candidateRepository.findWhere((c) => c.sessionId === id),
      partyRepository.findAll(),
    ]);
    const partiesById = new Map(parties.map((p) => [p.id, p]));

    return {
      session: {
        id: session.id,
        name: session.name,
        year: session.year,
        status: session.status,
        finishedAt: session.finishedAt,
      },
      positions: session.positions.map((code) => tallyPosition(code, votes, candidates, partiesById)),
    };
  },
};
