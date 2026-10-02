import { partyRepository } from '../repositories/party.repository.js';
import { candidateRepository } from '../repositories/candidate.repository.js';
import { PARTY_LIMITS, PARTY_STATUS } from '../rules/party-rules.js';
import { badRequest, conflict, notFound } from '../utils/errors.js';
import { isPlainObject, normalizeText, pick } from '../utils/object.js';

function normalizeFields(input) {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) throw badRequest('PARTY_NAME_REQUIRED', 'Informe o nome do partido.');
  if (name.length > PARTY_LIMITS.nameMaxLength) {
    throw badRequest('PARTY_NAME_TOO_LONG', `O nome pode ter no máximo ${PARTY_LIMITS.nameMaxLength} caracteres.`);
  }

  const acronym = typeof input.acronym === 'string' ? input.acronym.trim().toUpperCase() : '';
  if (!acronym) throw badRequest('PARTY_ACRONYM_REQUIRED', 'Informe a sigla do partido.');
  if (!/^[A-Z0-9-]+$/.test(acronym) || acronym.length > PARTY_LIMITS.acronymMaxLength) {
    throw badRequest(
      'PARTY_ACRONYM_INVALID',
      `A sigla deve ter até ${PARTY_LIMITS.acronymMaxLength} letras ou números, sem espaços.`,
    );
  }

  if (input.number === undefined || input.number === null || input.number === '') {
    throw badRequest('PARTY_NUMBER_REQUIRED', 'Informe o número do partido.');
  }
  const number = Number(input.number);
  if (!Number.isInteger(number) || number < PARTY_LIMITS.minNumber || number > PARTY_LIMITS.maxNumber) {
    throw badRequest(
      'PARTY_NUMBER_INVALID',
      `O número do partido deve estar entre ${PARTY_LIMITS.minNumber} e ${PARTY_LIMITS.maxNumber}.`,
    );
  }

  return { name, acronym, number };
}

function assertStatus(status) {
  if (!Object.values(PARTY_STATUS).includes(status)) {
    throw badRequest('PARTY_STATUS_INVALID', 'Status inválido. Use ACTIVE ou INACTIVE.');
  }
}

function throwConflict(kind) {
  if (kind === 'NUMBER') {
    throw conflict('PARTY_NUMBER_ALREADY_EXISTS', 'Este número já está sendo utilizado por outro partido.');
  }
  throw conflict('PARTY_ACRONYM_ALREADY_EXISTS', 'Esta sigla já está sendo utilizada por outro partido.');
}

async function findOrFail(id) {
  const party = await partyRepository.findById(id);
  if (!party) throw notFound('PARTY_NOT_FOUND', 'Partido não encontrado.');
  return party;
}

async function withCount(party) {
  const candidates = await candidateRepository.findWhere((c) => c.partyId === party.id);
  return { ...party, candidatesCount: candidates.length };
}

async function save(id, changes) {
  const result = await partyRepository.update(id, changes);
  if (result.notFound) throw notFound('PARTY_NOT_FOUND', 'Partido não encontrado.');
  if (result.conflict) throwConflict(result.conflict);
  return withCount(result.record);
}

export const partyService = {
  async list(filters = {}) {
    const search = normalizeText(filters.search).trim();
    let parties = await partyRepository.findAll();

    if (filters.status) parties = parties.filter((p) => p.status === filters.status);
    if (search) {
      parties = parties.filter((p) =>
        [p.name, p.acronym, String(p.number)].some((field) => normalizeText(field).includes(search)),
      );
    }

    const candidates = await candidateRepository.findAll();
    const countByParty = new Map();
    candidates.forEach((c) => countByParty.set(c.partyId, (countByParty.get(c.partyId) ?? 0) + 1));

    return parties
      .sort((a, b) => a.number - b.number)
      .map((party) => ({ ...party, candidatesCount: countByParty.get(party.id) ?? 0 }));
  },

  async getById(id) {
    return withCount(await findOrFail(id));
  },

  async create(input) {
    const data = normalizeFields(isPlainObject(input) ? input : {});
    const result = await partyRepository.create({
      ...data,
      status: PARTY_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
    });
    if (result.conflict) throwConflict(result.conflict);
    return withCount(result.record);
  },

  async update(id, input) {
    const current = await findOrFail(id);
    const changes = isPlainObject(input) ? input : {};

    const fields = normalizeFields({
      name: current.name,
      acronym: current.acronym,
      number: current.number,
      ...pick(changes, ['name', 'acronym', 'number']),
    });
    const status = changes.status ?? current.status;
    assertStatus(status);

    return save(id, { ...fields, status });
  },

  // DELETE desativa em vez de apagar: candidatos e votos continuam referenciando o partido.
  async deactivate(id) {
    await findOrFail(id);
    return save(id, { status: PARTY_STATUS.INACTIVE });
  },
};
