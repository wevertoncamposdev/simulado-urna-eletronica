import { createCollection } from '../database/index.js';

const collection = createCollection('parties');

// Regras de unicidade (equivalem a índices UNIQUE num banco SQL).
function findConflict(records, data, ignoreId = null) {
  const others = records.filter((record) => record.id !== ignoreId);
  if (others.some((record) => record.number === data.number)) return 'NUMBER';
  if (others.some((record) => record.acronym.toLowerCase() === data.acronym.toLowerCase())) {
    return 'ACRONYM';
  }
  return null;
}

// create/update retornam { record } | { conflict: 'NUMBER' | 'ACRONYM' } | { notFound: true }
export const partyRepository = {
  findAll: () => collection.findAll(),
  findById: (id) => collection.findById(id),
  findWhere: (predicate) => collection.findWhere(predicate),
  create: (data) => collection.insertUnless(data, (records) => findConflict(records, data)),
  update: (id, changes) =>
    collection.updateUnless(id, changes, (records, merged) => findConflict(records, merged, id)),
};
