import { createCollection } from '../database/index.js';

const collection = createCollection('candidates');

const sameBallotNumber = (a, b) =>
  a.sessionId === b.sessionId && a.position === b.position && a.number === b.number;

function findConflict(records, data, ignoreId = null) {
  const duplicated = records.some((record) => record.id !== ignoreId && sameBallotNumber(record, data));
  return duplicated ? 'NUMBER' : null;
}

// create/update retornam { record } | { conflict: 'NUMBER' } | { notFound: true }
export const candidateRepository = {
  findAll: () => collection.findAll(),
  findById: (id) => collection.findById(id),
  findWhere: (predicate) => collection.findWhere(predicate),
  create: (data) => collection.insertUnless(data, (records) => findConflict(records, data)),
  update: (id, changes) =>
    collection.updateUnless(id, changes, (records, merged) => findConflict(records, merged, id)),

  // Usado pela votação (Etapa 5) para identificar o candidato digitado.
  async findByBallotNumber(sessionId, position, number) {
    const [found] = await collection.findWhere(
      (c) => c.sessionId === sessionId && c.position === position && c.number === number,
    );
    return found ?? null;
  },
  async countBySession(sessionId) {
    return (await collection.findWhere((c) => c.sessionId === sessionId)).length;
  },
};
