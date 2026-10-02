import { createCollection } from '../database/index.js';

const collection = createCollection('positions');

// `code` é o identificador estável usado como chave estrangeira por sessões,
// candidatos e votos — gerado uma vez a partir do nome e nunca reatribuído.
// Único por conta (duas contas podem ter cada uma o seu "PRESIDENTE").
function findConflict(records, data, ignoreId = null) {
  const others = records.filter((record) => record.id !== ignoreId && record.userId === data.userId);
  return others.some((record) => record.code === data.code) ? 'CODE' : null;
}

export const positionRepository = {
  findAllForUser: (userId) => collection.findWhere((record) => record.userId === userId),
  findById: (id) => collection.findById(id),
  findByCode: async (code, userId) =>
    (await collection.findWhere((record) => record.userId === userId)).find((record) => record.code === code) ??
    null,
  create: (data) => collection.insertUnless(data, (records) => findConflict(records, data)),
  update: (id, changes) =>
    collection.updateUnless(id, changes, (records, merged) => findConflict(records, merged, id)),
  delete: (id) => collection.delete(id),
};
