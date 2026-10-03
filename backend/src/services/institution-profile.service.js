import { institutionProfileRepository } from '../repositories/institution-profile.repository.js';
import { INSTITUTION_PROFILE_LIMITS } from '../rules/institution-profile-rules.js';
import { badRequest } from '../utils/errors.js';
import { isPlainObject } from '../utils/object.js';

// Exige protocolo e pelo menos um "." no domínio — fora isso, qualquer coisa passa
// (não precisa validar TLD/porta/path, só descartar "não é bem uma URL").
const WEBSITE_PATTERN = /^https?:\/\/[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i;

function requiredField(value, { code, label, maxLength }) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw badRequest(code, `Informe ${label} da instituição.`);
  if (text.length > maxLength) {
    throw badRequest(code, `${label[0].toUpperCase()}${label.slice(1)} pode ter no máximo ${maxLength} caracteres.`);
  }
  return text;
}

// Guardado formatado ("(11) 99999-0000"), não só os dígitos — é o que a tela de
// perfil mostra de volta, sem precisar reformatar no cliente.
function normalizePhone(value) {
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (digits.length < 10 || digits.length > 11) {
    throw badRequest(
      'INSTITUTION_CONTACT_INVALID',
      'Informe um telefone válido, com DDD (ex.: (11) 99999-0000).',
    );
  }
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const splitAt = rest.length - 4;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}

function normalizeWebsite(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return null;
  if (!WEBSITE_PATTERN.test(text) || text.length > INSTITUTION_PROFILE_LIMITS.websiteMaxLength) {
    throw badRequest(
      'INSTITUTION_WEBSITE_INVALID',
      'Informe um link válido (ex.: https://suainstituicao.com.br).',
    );
  }
  return text;
}

export const institutionProfileService = {
  async getByUser(userId) {
    return institutionProfileRepository.findByUserId(userId);
  },

  async save(input, userId) {
    const data = isPlainObject(input) ? input : {};

    const name = requiredField(data.name, {
      code: 'INSTITUTION_NAME_REQUIRED',
      label: 'o nome',
      maxLength: INSTITUTION_PROFILE_LIMITS.nameMaxLength,
    });
    const address = requiredField(data.address, {
      code: 'INSTITUTION_ADDRESS_REQUIRED',
      label: 'o endereço',
      maxLength: INSTITUTION_PROFILE_LIMITS.addressMaxLength,
    });
    const contact = normalizePhone(data.contact);
    const website = normalizeWebsite(data.website);

    return institutionProfileRepository.upsertForUser(userId, { name, address, contact, website });
  },
};
