import { createCollection } from '../database/index.js';

const collection = createCollection('people');

// Identidade reaproveitável entre candidaturas (nome + foto). Sem unicidade: duas
// pessoas podem ter o mesmo nome, quem identifica é o id.
export const personRepository = {
  findAllForUser: (userId) => collection.findWhere((record) => record.userId === userId),
  findById: (id) => collection.findById(id),
  create: (data) => collection.insert(data),
  update: (id, changes) => collection.update(id, changes),
  delete: (id) => collection.delete(id),
};
