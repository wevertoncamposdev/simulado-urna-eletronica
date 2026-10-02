import { candidateRepository } from '../repositories/candidate.repository.js';
import { partyRepository } from '../repositories/party.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import { CANDIDATE_IDENTITY_FIELDS, CANDIDATE_LIMITS, CANDIDATE_STATUS } from '../rules/candidate-rules.js';
import { PARTY_STATUS } from '../rules/party-rules.js';
import { POSITION_RULES, getPositionRule } from '../rules/position-rules.js';
import { SESSION_STATUS } from '../rules/session-rules.js';
import { badRequest, conflict, notFound } from '../utils/errors.js';
import { isPlainObject, normalizeText, pick } from '../utils/object.js';
import { isStoredPhotoPath, parsePhotoDataUri, photoStorage } from '../storage/photo-storage.js';

// Uma captura da webcam (320x240, JPEG) fica na casa de dezenas de KB — bem abaixo
// disso. O limite também precisa caber com folga no corpo da requisição JSON como
// um todo (MAX_BODY_BYTES em utils/http.js), já que o base64 inflaciona ~33%.
const PHOTO_MAX_BYTES = 300_000;

// ---------- validações de campo ----------

function normalizeName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name) throw badRequest('CANDIDATE_NAME_REQUIRED', 'Informe o nome do candidato.');
  if (name.length > CANDIDATE_LIMITS.nameMaxLength) {
    throw badRequest(
      'CANDIDATE_NAME_TOO_LONG',
      `O nome pode ter no máximo ${CANDIDATE_LIMITS.nameMaxLength} caracteres.`,
    );
  }
  return name;
}

// Aceita três formatos de entrada: um endereço http(s) (link externo), um caminho
// já salvo por este serviço (edição sem trocar a foto), ou uma captura da webcam
// em data URI — que é decodificada e gravada em disco por photoStorage.save.
async function normalizePhoto(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    throw badRequest('CANDIDATE_PHOTO_INVALID', 'A foto deve ser um endereço http(s) ou uma captura da câmera.');
  }

  if (isStoredPhotoPath(value)) return value;

  const dataUri = parsePhotoDataUri(value);
  if (dataUri) {
    if (!dataUri.extension) {
      throw badRequest('CANDIDATE_PHOTO_INVALID', 'Formato de imagem não suportado.');
    }
    if (dataUri.buffer.length > PHOTO_MAX_BYTES) {
      throw badRequest('CANDIDATE_PHOTO_TOO_LARGE', 'A foto capturada é grande demais.');
    }
    return photoStorage.save(dataUri.buffer, dataUri.extension);
  }

  const photo = value.trim();
  if (!/^https?:\/\/\S+$/i.test(photo) || photo.length > CANDIDATE_LIMITS.photoMaxLength) {
    throw badRequest(
      'CANDIDATE_PHOTO_INVALID',
      'A foto deve ser um endereço http(s) válido ou uma captura da câmera.',
    );
  }
  return photo;
}

// O número é guardado como texto para preservar zeros à esquerda ("05").
function normalizeNumber(value, positionRule) {
  const number = typeof value === 'number' ? String(value) : value;
  if (number === undefined || number === null || number === '') {
    throw badRequest('CANDIDATE_NUMBER_REQUIRED', 'Informe o número do candidato.');
  }
  if (typeof number !== 'string' || !/^\d+$/.test(number) || number.length !== positionRule.digits) {
    throw badRequest(
      'CANDIDATE_NUMBER_INVALID',
      `Para ${positionRule.label}, o número deve ter exatamente ${positionRule.digits} dígitos.`,
    );
  }
  return number;
}

function assertStatus(status) {
  if (!Object.values(CANDIDATE_STATUS).includes(status)) {
    throw badRequest('CANDIDATE_STATUS_INVALID', 'Status inválido. Use ACTIVE ou INACTIVE.');
  }
}

// ---------- verificações que consultam outras entidades ----------

async function requireSession(sessionId) {
  if (!sessionId) throw badRequest('CANDIDATE_SESSION_REQUIRED', 'Informe a sessão do candidato.');
  const session = await sessionRepository.findById(sessionId);
  if (!session) throw badRequest('CANDIDATE_SESSION_NOT_FOUND', 'Sessão não encontrada.');
  return session;
}

async function requireActiveParty(partyId) {
  if (!partyId) throw badRequest('CANDIDATE_PARTY_REQUIRED', 'Informe o partido do candidato.');
  const party = await partyRepository.findById(partyId);
  if (!party) throw badRequest('CANDIDATE_PARTY_NOT_FOUND', 'Partido não encontrado.');
  if (party.status !== PARTY_STATUS.ACTIVE) {
    throw conflict('CANDIDATE_PARTY_INACTIVE', 'Este partido está inativo e não aceita novos candidatos.');
  }
  return party;
}

function requirePositionRule(session, code) {
  if (!code) throw badRequest('CANDIDATE_POSITION_REQUIRED', 'Informe o cargo do candidato.');
  const rule = getPositionRule(code);
  if (!rule) throw badRequest('CANDIDATE_POSITION_INVALID', 'Cargo inválido.');
  if (!session.positions.includes(code)) {
    throw badRequest('CANDIDATE_POSITION_NOT_ENABLED', 'Este cargo não está habilitado nesta sessão.');
  }
  return rule;
}

const numberTaken = () =>
  conflict('CANDIDATE_NUMBER_ALREADY_EXISTS', 'Este número já está sendo utilizado para este cargo.');

const sessionLocked = (message) => conflict('CANDIDATE_SESSION_LOCKED', message);

async function findOrFail(id) {
  const candidate = await candidateRepository.findById(id);
  if (!candidate) throw notFound('CANDIDATE_NOT_FOUND', 'Candidato não encontrado.');
  return candidate;
}

// ---------- resposta enriquecida com o partido ----------

const summarizeParty = (party) =>
  party
    ? { id: party.id, name: party.name, acronym: party.acronym, number: party.number, status: party.status }
    : null;

const withParty = (candidate, partiesById) => ({
  ...candidate,
  party: summarizeParty(partiesById.get(candidate.partyId)),
});

async function loadWithParty(candidate) {
  const party = await partyRepository.findById(candidate.partyId);
  return { ...candidate, party: summarizeParty(party) };
}

async function saveChanges(id, changes) {
  const result = await candidateRepository.update(id, changes);
  if (result.notFound) throw notFound('CANDIDATE_NOT_FOUND', 'Candidato não encontrado.');
  if (result.conflict) throw numberTaken();
  return loadWithParty(result.record);
}

// ---------- serviço ----------

export const candidateService = {
  async list(filters = {}) {
    const search = normalizeText(filters.search).trim();

    let candidates = await candidateRepository.findWhere(
      (c) =>
        (!filters.sessionId || c.sessionId === filters.sessionId) &&
        (!filters.position || c.position === filters.position) &&
        (!filters.partyId || c.partyId === filters.partyId) &&
        (!filters.status || c.status === filters.status),
    );

    const parties = await partyRepository.findAll();
    const partiesById = new Map(parties.map((p) => [p.id, p]));
    candidates = candidates.map((c) => withParty(c, partiesById));

    if (search) {
      candidates = candidates.filter((c) =>
        [c.name, c.number, c.party?.acronym, c.party?.name].some((field) =>
          normalizeText(field).includes(search),
        ),
      );
    }

    const order = (code) => POSITION_RULES[code]?.order ?? 99;
    return candidates.sort(
      (a, b) =>
        order(a.position) - order(b.position) ||
        a.number.localeCompare(b.number) ||
        a.name.localeCompare(b.name, 'pt-BR'),
    );
  },

  async getById(id) {
    return loadWithParty(await findOrFail(id));
  },

  async create(input) {
    const data = isPlainObject(input) ? input : {};

    const session = await requireSession(data.sessionId);
    if (session.status !== SESSION_STATUS.DRAFT) {
      throw sessionLocked('Só é possível cadastrar candidatos em sessões em rascunho.');
    }
    const positionRule = requirePositionRule(session, data.position);
    const party = await requireActiveParty(data.partyId);
    const number = normalizeNumber(data.number, positionRule);
    const name = normalizeName(data.name);
    const photo = await normalizePhoto(data.photo);

    const result = await candidateRepository.create({
      sessionId: session.id,
      partyId: party.id,
      position: data.position,
      name,
      number,
      photo,
      status: CANDIDATE_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
    });
    if (result.conflict) {
      if (photo) await photoStorage.remove(photo); // evita foto órfã quando o número já estava em uso
      throw numberTaken();
    }
    return loadWithParty(result.record);
  },

  async update(id, input) {
    const current = await findOrFail(id);
    const session = await sessionRepository.findById(current.sessionId);
    if (session.status === SESSION_STATUS.FINISHED) {
      throw sessionLocked('A eleição foi finalizada e não aceita alterações.');
    }

    const changes = isPlainObject(input) ? input : {};
    if (changes.sessionId !== undefined && changes.sessionId !== current.sessionId) {
      throw badRequest('CANDIDATE_SESSION_IMMUTABLE', 'Não é possível mover o candidato para outra sessão.');
    }

    const merged = {
      ...current,
      ...pick(changes, [...CANDIDATE_IDENTITY_FIELDS, 'name', 'photo', 'status']),
    };

    const identityChanged = CANDIDATE_IDENTITY_FIELDS.some(
      (field) => String(merged[field]) !== String(current[field]),
    );
    if (identityChanged && session.status !== SESSION_STATUS.DRAFT) {
      throw sessionLocked('Depois que a votação abre, só é possível alterar nome, foto e status.');
    }

    if (merged.partyId !== current.partyId) await requireActiveParty(merged.partyId);
    const positionRule = requirePositionRule(session, merged.position);
    assertStatus(merged.status);
    const number = normalizeNumber(merged.number, positionRule);
    const name = normalizeName(merged.name);
    const photo = await normalizePhoto(merged.photo);

    const saved = await saveChanges(id, {
      partyId: merged.partyId,
      position: merged.position,
      number,
      name,
      photo,
      status: merged.status,
    });

    // Só apaga o arquivo antigo depois que a atualização é confirmada, e só se
    // realmente era um arquivo nosso (link externo ou nulo não tem o que apagar).
    if (current.photo && current.photo !== photo) await photoStorage.remove(current.photo);
    return saved;
  },

  // DELETE desativa: o candidato deixa de receber votos, mas o histórico é preservado.
  async deactivate(id) {
    const current = await findOrFail(id);
    const session = await sessionRepository.findById(current.sessionId);
    if (session.status === SESSION_STATUS.FINISHED) {
      throw sessionLocked('A eleição foi finalizada e não aceita alterações.');
    }
    return saveChanges(id, { status: CANDIDATE_STATUS.INACTIVE });
  },
};
