import { positionRepository } from '../repositories/position.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { USER_LIMITS } from '../rules/user-rules.js';
import { badRequest, conflict, notFound, unauthorized } from '../utils/errors.js';
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

const sanitize = (user) => ({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });

function issueToken(user) {
  return signJwt({ sub: user.id });
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

    return { user: sanitize(result.record), token: issueToken(result.record) };
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

    return { user: sanitize(user), token: issueToken(user) };
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw notFound('USER_NOT_FOUND', 'Usuário não encontrado.');
    return sanitize(user);
  },
};
