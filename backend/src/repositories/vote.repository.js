import { createCollection } from '../database/index.js';

const collection = createCollection('votes');

export const voteRepository = {
  findAll: () => collection.findAll(),
  findWhere: (predicate) => collection.findWhere(predicate),
  create: (data) => collection.insert(data),
  async countBySession(sessionId) {
    return (await collection.findWhere((v) => v.sessionId === sessionId)).length;
  },
};
