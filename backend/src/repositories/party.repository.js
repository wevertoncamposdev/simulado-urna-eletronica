import { prisma, serializeDates, serializeAll, isUniqueViolation, conflictFieldFrom } from '../database/index.js';

const CONFLICT_FIELDS = { number: 'NUMBER', acronym: 'ACRONYM' };

// create/update retornam { record } | { conflict: 'NUMBER' | 'ACRONYM' } | { notFound: true }
export const partyRepository = {
  async findAllForUser(userId) {
    return serializeAll(await prisma.party.findMany({ where: { userId } }));
  },

  async findById(id) {
    return serializeDates(await prisma.party.findUnique({ where: { id } }));
  },

  async findWhere(predicate) {
    const all = serializeAll(await prisma.party.findMany());
    return all.filter(predicate);
  },

  async create(data) {
    try {
      const record = await prisma.party.create({ data });
      return { record: serializeDates(record) };
    } catch (error) {
      if (isUniqueViolation(error)) return { conflict: conflictFieldFrom(error, CONFLICT_FIELDS) ?? 'NUMBER' };
      throw error;
    }
  },

  async update(id, changes) {
    try {
      const record = await prisma.party.update({ where: { id }, data: changes });
      return { record: serializeDates(record) };
    } catch (error) {
      if (error?.code === 'P2025') return { notFound: true };
      if (isUniqueViolation(error)) return { conflict: conflictFieldFrom(error, CONFLICT_FIELDS) ?? 'NUMBER' };
      throw error;
    }
  },
};
