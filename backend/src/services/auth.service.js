import { randomInt, createHash } from 'node:crypto';
import { emailVerificationRepository } from '../repositories/email-verification.repository.js';
import { positionRepository } from '../repositories/position.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { EMAIL_VERIFICATION_RULES } from '../rules/email-verification-rules.js';
import { USER_LIMITS } from '../rules/user-rules.js';
import { emailService } from './email.service.js';
import { badRequest, conflict, forbidden, notFound, tooManyRequests, unauthorized } from '../utils/errors.js';
import { signJwt } from '../utils/jwt.js';
import { isPlainObject, normalizeText } from '../utils/object.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mesmos cargos brasileiros que o simulador sempre ofereceu — cadastrados uma
// vez para cada conta nova, já editáveis/removíveis dali em diante (ver Cargos).
const DEFAULT_POSITIONS = [
  { label: 'Presidente', digits: 2, order: 1, twoRoundEnabled: true },
  { label: 'Governador', digits: 2, order: 2, twoRoundEnabled: true },
  { label: 'Senador', digits: 3, order: 3, twoRoundEnabled: false },
  { label: 'Deputado Federal', digits: 4, order: 4, twoRoundEnabled: false },
  { label: 'Deputado Estadual', digits: 5, order: 5, twoRoundEnabled: false },
  { label: 'Prefeito', digits: 2, order: 6, twoRoundEnabled: false },
  { label: 'Vereador', digits: 5, order: 7, twoRoundEnabled: false },
];

async function seedDefaultPositions(userId) {
  for (const position of DEFAULT_POSITIONS) {
    // Códigos previsíveis (PRESIDENTE, GOVERNADOR...) em vez de deixar o
    // slugify decidir, pra bater exatamente com o que o resto do app espera.
    const code = normalizeText(position.label).toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    await positionRepository.create({ ...position, code, userId, createdAt: new Date().toISOString() });
  }
}

function normalizeName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name) throw badRequest('USER_NAME_REQUIRED', 'Informe seu nome.');
  if (name.length > USER_LIMITS.nameMaxLength) {
    throw badRequest('USER_NAME_TOO_LONG', `O nome pode ter no máximo ${USER_LIMITS.nameMaxLength} caracteres.`);
  }
  return name;
}

function normalizeEmail(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!email) throw badRequest('USER_EMAIL_REQUIRED', 'Informe seu e-mail.');
  if (!EMAIL_PATTERN.test(email) || email.length > USER_LIMITS.emailMaxLength) {
    throw badRequest('USER_EMAIL_INVALID', 'Informe um e-mail válido.');
  }
  return email;
}

function assertPassword(value) {
  if (typeof value !== 'string' || value.length < USER_LIMITS.passwordMinLength) {
    throw badRequest(
      'USER_PASSWORD_TOO_SHORT',
      `A senha deve ter pelo menos ${USER_LIMITS.passwordMinLength} caracteres.`,
    );
  }
}

const sanitize = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: Boolean(user.emailVerifiedAt),
  createdAt: user.createdAt,
});

function issueToken(user) {
  return signJwt({ sub: user.id });
}

// Guardado como string (zero à esquerda, mesmo motivo do número de candidato — ver
// README) — comparado só por hash, nunca armazenado em texto puro.
function generateVerificationCode() {
  return String(randomInt(0, 10 ** EMAIL_VERIFICATION_RULES.codeLength)).padStart(
    EMAIL_VERIFICATION_RULES.codeLength,
    '0',
  );
}

const hashCode = (code) => createHash('sha256').update(code).digest('hex');

async function issueVerificationCode(user) {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_RULES.ttlMinutes * 60 * 1000);
  await emailVerificationRepository.upsertForUser(user.id, { codeHash: hashCode(code), expiresAt });

  try {
    await emailService.sendVerificationCode(user.email, code);
  } catch (error) {
    // A conta e o código já existem — o usuário ainda pode pedir reenvio depois.
    // Não faz sentido devolver 500 pra um cadastro que já foi concluído.
    console.error('[email] falha ao enviar código de verificação', error);
  }
}

export const authService = {
  async register(input) {
    const data = isPlainObject(input) ? input : {};
    const name = normalizeName(data.name);
    const email = normalizeEmail(data.email);
    assertPassword(data.password);

    const result = await userRepository.create({
      name,
      email,
      passwordHash: hashPassword(data.password),
      createdAt: new Date().toISOString(),
    });
    if (result.conflict) {
      throw conflict('USER_EMAIL_ALREADY_EXISTS', 'Este e-mail já está cadastrado.');
    }
    await seedDefaultPositions(result.record.id);
    await issueVerificationCode(result.record);

    return { user: sanitize(result.record) };
  },

  async login(input) {
    const data = isPlainObject(input) ? input : {};
    const email = normalizeEmail(data.email);
    if (typeof data.password !== 'string' || !data.password) {
      throw badRequest('USER_PASSWORD_REQUIRED', 'Informe sua senha.');
    }

    const user = await userRepository.findByEmail(email);
    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      throw unauthorized('AUTH_INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');
    }
    if (!user.emailVerifiedAt) {
      throw forbidden('EMAIL_NOT_VERIFIED', 'Confirme seu e-mail antes de entrar.');
    }

    return { user: sanitize(user), token: issueToken(user) };
  },

  async verifyEmail(input) {
    const data = isPlainObject(input) ? input : {};
    const email = normalizeEmail(data.email);
    const code = typeof data.code === 'string' ? data.code.trim() : '';
    if (!code) throw badRequest('VERIFICATION_CODE_REQUIRED', 'Informe o código recebido por e-mail.');

    const user = await userRepository.findByEmail(email);
    if (!user) throw notFound('USER_NOT_FOUND', 'Usuário não encontrado.');
    if (user.emailVerifiedAt) throw conflict('EMAIL_ALREADY_VERIFIED', 'Este e-mail já está confirmado.');

    const pending = await emailVerificationRepository.findByUserId(user.id);
    if (!pending) {
      throw badRequest('VERIFICATION_CODE_NOT_FOUND', 'Nenhum código pendente. Peça um novo código.');
    }
    if (new Date(pending.expiresAt) < new Date()) {
      throw badRequest('VERIFICATION_CODE_EXPIRED', 'Esse código expirou. Peça um novo código.');
    }
    if (pending.attempts >= EMAIL_VERIFICATION_RULES.maxAttempts) {
      throw badRequest('VERIFICATION_CODE_LOCKED', 'Muitas tentativas. Peça um novo código.');
    }
    if (hashCode(code) !== pending.codeHash) {
      await emailVerificationRepository.incrementAttempts(pending.id);
      throw badRequest('VERIFICATION_CODE_INVALID', 'Código incorreto.');
    }

    const verifiedUser = await userRepository.markEmailVerified(user.id);
    await emailVerificationRepository.deleteByUserId(user.id);

    return { user: sanitize(verifiedUser), token: issueToken(verifiedUser) };
  },

  async resendVerification(input) {
    const data = isPlainObject(input) ? input : {};
    const email = normalizeEmail(data.email);

    const user = await userRepository.findByEmail(email);
    if (!user) throw notFound('USER_NOT_FOUND', 'Usuário não encontrado.');
    if (user.emailVerifiedAt) throw conflict('EMAIL_ALREADY_VERIFIED', 'Este e-mail já está confirmado.');

    const pending = await emailVerificationRepository.findByUserId(user.id);
    if (pending) {
      const elapsedSeconds = (Date.now() - new Date(pending.createdAt).getTime()) / 1000;
      if (elapsedSeconds < EMAIL_VERIFICATION_RULES.resendCooldownSeconds) {
        throw tooManyRequests(
          'VERIFICATION_RESEND_TOO_SOON',
          'Aguarde um minuto antes de pedir um novo código.',
        );
      }
    }

    await issueVerificationCode(user);
    return { sent: true };
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw notFound('USER_NOT_FOUND', 'Usuário não encontrado.');
    return sanitize(user);
  },
};
