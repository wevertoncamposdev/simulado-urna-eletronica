import { createCollection } from '../database/index.js';

const collection = createCollection('users');

// E-mail é o identificador de login — único, comparado em caixa baixa.
function findConflict(records, data, ignoreId = null) {
  const others = records.filter((record) => record.id !== ignoreId);
  return others.some((record) => record.email.toLowerCase() === data.email.toLowerCase()) ? 'EMAIL' : null;
}

export const userRepository = {
  findById: (id) => collection.findById(id),
  async findByEmail(email) {
    const records = await collection.findAll();
    return records.find((record) => record.email.toLowerCase() === email.toLowerCase()) ?? null;
  },
  create: (data) => collection.insertUnless(data, (records) => findConflict(records, data)),
};
