import { prisma, serializeDates, serializeAll, isUniqueViolation } from '../database/index.js';

// `code` é o identificador estável usado como chave estrangeira por sessões,
// candidatos e votos — gerado uma vez a partir do nome e nunca reatribuído.
// Único por conta (duas contas podem ter cada uma o seu "PRESIDENTE").
export const positionRepository = {
  async findAllForUser(userId) {
    return serializeAll(await prisma.position.findMany({ where: { userId } }));
  },

  async findById(id) {
    return serializeDates(await prisma.position.findUnique({ where: { id } }));
  },

  async findByCode(code, userId) {
    return serializeDates(await prisma.position.findUnique({ where: { userId_code: { userId, code } } }));
  },

  async create(data) {
    try {
      const record = await prisma.position.create({ data });
      return { record: serializeDates(record) };
    } catch (error) {
      if (isUniqueViolation(error)) return { conflict: 'CODE' };
      throw error;
    }
  },

  async update(id, changes) {
    try {
      const record = await prisma.position.update({ where: { id }, data: changes });
      return { record: serializeDates(record) };
    } catch (error) {
      if (error?.code === 'P2025') return { notFound: true };
      if (isUniqueViolation(error)) return { conflict: 'CODE' };
      throw error;
    }
  },

  async delete(id) {
    try {
      await prisma.position.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error?.code === 'P2025') return false;
      throw error;
    }
  },
};
