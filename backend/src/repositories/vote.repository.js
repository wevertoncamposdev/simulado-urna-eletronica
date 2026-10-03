import { prisma, serializeDates, serializeAll } from '../database/index.js';

// `seq` só existe pra garantir a ordem de leitura — nunca sai do repository.
const omitSeq = ({ seq, ...rest }) => rest;

export const voteRepository = {
  async findAll() {
    return serializeAll(await prisma.vote.findMany({ orderBy: { seq: 'asc' } })).map(omitSeq);
  },

  async findWhere(predicate) {
    const all = serializeAll(await prisma.vote.findMany({ orderBy: { seq: 'asc' } })).map(omitSeq);
    return all.filter(predicate);
  },

  async create(data) {
    return omitSeq(serializeDates(await prisma.vote.create({ data })));
  },

  countBySession(sessionId) {
    return prisma.vote.count({ where: { sessionId } });
  },
};
