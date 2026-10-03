import { prisma, serializeDates, isUniqueViolation } from '../database/index.js';

export const userRepository = {
  async findById(id) {
    return serializeDates(await prisma.user.findUnique({ where: { id } }));
  },

  async findByEmail(email) {
    // E-mail já chega em caixa baixa de auth.service (normalizeEmail) — comparação exata.
    return serializeDates(await prisma.user.findUnique({ where: { email: email.toLowerCase() } }));
  },

  async create(data) {
    try {
      const record = await prisma.user.create({ data });
      return { record: serializeDates(record) };
    } catch (error) {
      if (isUniqueViolation(error)) return { conflict: 'EMAIL' };
      throw error;
    }
  },

  async markEmailVerified(id) {
    return serializeDates(
      await prisma.user.update({ where: { id }, data: { emailVerifiedAt: new Date() } }),
    );
  },
};
