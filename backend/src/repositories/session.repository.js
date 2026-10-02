import { createCollection } from '../database/index.js';

const collection = createCollection('sessions');

// Contrato do repository: se um dia virar SQLite/PostgreSQL, estes métodos continuam iguais.
export const sessionRepository = {
  findAll: () => collection.findAll(),
  findById: (id) => collection.findById(id),
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
