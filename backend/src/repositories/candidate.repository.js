import { prisma, serializeDates, serializeAll, isUniqueViolation } from '../database/index.js';

// create/update retornam { record } | { conflict: 'NUMBER' } | { notFound: true }
export const candidateRepository = {
  async findAllForUser(userId) {
    return serializeAll(await prisma.candidate.findMany({ where: { userId } }));
  },

  async findById(id) {
    return serializeDates(await prisma.candidate.findUnique({ where: { id } }));
  },

  async findWhere(predicate) {
    const all = serializeAll(await prisma.candidate.findMany());
    return all.filter(predicate);
  },

  async create(data) {
    try {
      const record = await prisma.candidate.create({ data });
      return { record: serializeDates(record) };
    } catch (error) {
      if (isUniqueViolation(error)) return { conflict: 'NUMBER' };
      throw error;
    }
  },

  async update(id, changes) {
    try {
      const record = await prisma.candidate.update({ where: { id }, data: changes });
      return { record: serializeDates(record) };
    } catch (error) {
      if (error?.code === 'P2025') return { notFound: true };
      if (isUniqueViolation(error)) return { conflict: 'NUMBER' };
      throw error;
    }
  },

  // Usado pela votação (Etapa 5) para identificar o candidato digitado.
  async findByBallotNumber(sessionId, position, number) {
    return serializeDates(
      await prisma.candidate.findUnique({ where: { sessionId_position_number: { sessionId, position, number } } }),
    );
  },

  async countBySession(sessionId) {
    return prisma.candidate.count({ where: { sessionId } });
  },
};
