import { institutionProfileRepository } from '../repositories/institution-profile.repository.js';
import { INSTITUTION_PROFILE_LIMITS } from '../rules/institution-profile-rules.js';
import { badRequest } from '../utils/errors.js';
import { isPlainObject } from '../utils/object.js';

const WEBSITE_PATTERN = /^https?:\/\/.+/i;

function requiredField(value, { field, code, label, maxLength }) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw badRequest(code, `Informe ${label} da instituição.`);
  if (text.length > maxLength) {
    throw badRequest(code, `${label[0].toUpperCase()}${label.slice(1)} pode ter no máximo ${maxLength} caracteres.`);
  }
  return text;
}

function normalizeWebsite(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return null;
  if (!WEBSITE_PATTERN.test(text) || text.length > INSTITUTION_PROFILE_LIMITS.websiteMaxLength) {
    throw badRequest('INSTITUTION_WEBSITE_INVALID', 'Informe um link válido (começando com http:// ou https://).');
  }
  return text;
}

export const institutionProfileService = {
  async save(input, userId) {
    const data = isPlainObject(input) ? input : {};

    const name = requiredField(data.name, {
      field: 'name',
      code: 'INSTITUTION_NAME_REQUIRED',
      label: 'o nome',
      maxLength: INSTITUTION_PROFILE_LIMITS.nameMaxLength,
    });
    const address = requiredField(data.address, {
      field: 'address',
      code: 'INSTITUTION_ADDRESS_REQUIRED',
      label: 'o endereço',
      maxLength: INSTITUTION_PROFILE_LIMITS.addressMaxLength,
    });
    const contact = requiredField(data.contact, {
      field: 'contact',
      code: 'INSTITUTION_CONTACT_REQUIRED',
      label: 'um contato',
      maxLength: INSTITUTION_PROFILE_LIMITS.contactMaxLength,
    });
    const website = normalizeWebsite(data.website);

    return institutionProfileRepository.upsertForUser(userId, { name, address, contact, website });
  },
};
