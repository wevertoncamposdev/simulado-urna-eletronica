import { sessionRepository } from '../repositories/session.repository.js';
import { voteRepository } from '../repositories/vote.repository.js';
import { SESSION_STATUS } from '../rules/session-rules.js';
import { conflict, notFound } from '../utils/errors.js';
import { computeVoteHash } from '../utils/hash.js';

async function findSessionOrFail(id, userId) {
  const session = await sessionRepository.findById(id);
  if (!session || session.userId !== userId) throw notFound('SESSION_NOT_FOUND', 'Sessão não encontrada.');
  return session;
}

// Assim como os resultados, a auditoria só é publicada depois que a eleição fecha.
function requireFinished(session) {
  if (session.status !== SESSION_STATUS.FINISHED) {
    throw conflict('AUDIT_NOT_AVAILABLE', 'A auditoria só fica disponível depois que a eleição é finalizada.');
  }
}

// Reconfere a cadeia de hashes, na ordem em que os votos foram gravados:
// - hashValid: o hash bate com o conteúdo do voto + o previousHash gravado nele;
// - previousHashValid: o previousHash gravado aponta para o hash do voto anterior.
// As duas juntas detectam alteração de conteúdo, remoção e reordenação de votos.
function verifyChain(votes) {
  let expectedPreviousHash = null;
  let brokenAtIndex = null;

  const checked = votes.map((vote, index) => {
    const hashValid = vote.hash === computeVoteHash(vote, vote.previousHash);
    const previousHashValid = vote.previousHash === expectedPreviousHash;
    if (brokenAtIndex === null && !(hashValid && previousHashValid)) brokenAtIndex = index;
    expectedPreviousHash = vote.hash;
    return { ...vote, hashValid, previousHashValid };
  });

  return { valid: brokenAtIndex === null, brokenAtIndex, votes: checked };
}

export const auditService = {
  async getBySession(id, userId) {
    const session = await findSessionOrFail(id, userId);
    requireFinished(session);

    const votes = await voteRepository.findWhere((v) => v.sessionId === id);
    const { valid, brokenAtIndex, votes: checkedVotes } = verifyChain(votes);

    return {
      session: {
        id: session.id,
        name: session.name,
        year: session.year,
        status: session.status,
        finishedAt: session.finishedAt,
      },
      totalVotes: votes.length,
      valid,
      brokenAtIndex,
      votes: checkedVotes,
    };
  },
};
