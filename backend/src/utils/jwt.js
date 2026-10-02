import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

const base64url = (value) => Buffer.from(value).toString('base64url');
const base64urlJson = (value) => base64url(JSON.stringify(value));

function sign(data) {
  return createHmac('sha256', config.jwtSecret).update(data).digest('base64url');
}

// JWT (HS256) mínimo, sem biblioteca: header.payload.assinatura, cada parte em
// base64url. O mesmo esquema de qualquer JWT — só implementado à mão, como o
// resto do backend.
export function signJwt(payload, { expiresInSeconds = DEFAULT_TTL_SECONDS } = {}) {
  const header = base64urlJson({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const body = base64urlJson({ ...payload, iat: now, exp: now + expiresInSeconds });
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
}

// Retorna o payload se a assinatura bater e o token não tiver expirado; null caso
// contrário (nunca lança — quem chama decide se isso vira 401).
export function verifyJwt(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const expected = sign(`${header}.${body}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (typeof payload.exp === 'number' && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
