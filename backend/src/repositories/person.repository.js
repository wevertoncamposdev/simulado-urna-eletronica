import { prisma, serializeDates, serializeAll } from '../database/index.js';

// Identidade reaproveitável entre candidaturas (nome + foto). Sem unicidade: duas
// pessoas podem ter o mesmo nome, quem identifica é o id.
export const personRepository = {
  async findAllForUser(userId) {
    return serializeAll(await prisma.person.findMany({ where: { userId } }));
  },

  async findById(id) {
    return serializeDates(await prisma.person.findUnique({ where: { id } }));
  },

  async create(data) {
    return serializeDates(await prisma.person.create({ data }));
  },

  async update(id, changes) {
    return serializeDates(await prisma.person.update({ where: { id }, data: changes }));
  },

  async delete(id) {
    try {
      await prisma.person.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error?.code === 'P2025') return false;
      throw error;
    }
  },
};
