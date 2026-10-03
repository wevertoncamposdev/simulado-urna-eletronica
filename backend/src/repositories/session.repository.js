import { createCollection } from '../database/index.js';

const collection = createCollection('sessions');

// Contrato do repository: se um dia virar SQLite/PostgreSQL, estes métodos continuam iguais.
export const sessionRepository = {
  findAllForUser: (userId) => collection.findWhere((record) => record.userId === userId),
  findById: (id) => collection.findById(id),
  // Sem escopo por conta de propósito: o token em si já é a autorização (ver
  // public-voting.service) — quem o tem pode votar, não importa quem é o dono.
  async findByPublicToken(token) {
    const records = await collection.findAll();
    return records.find((record) => record.publicToken === token) ?? null;
  },
  create: (data) => collection.insert(data),
  update: (id, data) => collection.update(id, data),
  remove: (id) => collection.delete(id),
  async count() {
    return (await collection.findAll()).length;
  },

  // Dá exclusividade sobre a coleção de sessões para quem precisa checar e agir
  // atomicamente em relação a um update/finish concorrente (ver vote.service).
  withLock: (task) => collection.runExclusive(task),
};
