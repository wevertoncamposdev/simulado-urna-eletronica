import { randomBytes, randomUUID } from 'node:crypto';

export const generateId = () => randomUUID();

// Token de compartilhamento público (link de votação): aleatório e não
// sequencial, sem ligação com o id da sessão — dá pra trocar um sem afetar o outro.
export const generatePublicToken = () => randomBytes(18).toString('base64url');
