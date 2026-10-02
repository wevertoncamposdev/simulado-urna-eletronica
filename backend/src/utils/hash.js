import { createHash } from 'node:crypto';

// Cadeia de hashes dos votos: cada voto referencia o hash do voto anterior da
// mesma sessão. Qualquer alteração, remoção ou reordenação de um registro depois
// de gravado quebra essa cadeia — é o que audit.service verifica.
export function computeVoteHash(vote, previousHash) {
  const payload = [
    vote.sessionId,
    vote.position,
    vote.candidateId ?? '',
    vote.candidateNumber ?? '',
    vote.type,
    vote.createdAt,
    previousHash ?? '',
  ].join('|');
  return createHash('sha256').update(payload).digest('hex');
}
