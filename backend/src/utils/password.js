import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

// scrypt (nativo do Node, sem dependência externa) com um salt aleatório por
// senha. Formato salvo: "<salt em hex>:<hash em hex>".
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

// Comparação em tempo constante (timingSafeEqual) para não vazar, pelo tempo de
// resposta, quantos bytes do hash batem.
export function verifyPassword(password, stored) {
  const [salt, hash] = typeof stored === 'string' ? stored.split(':') : [];
  if (!salt || !hash) return false;

  const candidate = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
