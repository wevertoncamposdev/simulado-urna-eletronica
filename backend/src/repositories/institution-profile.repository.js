import { prisma, serializeDates } from '../database/index.js';

export const institutionProfileRepository = {
  async findByUserId(userId) {
    return serializeDates(await prisma.institutionProfile.findUnique({ where: { userId } }));
  },

  async upsertForUser(userId, data) {
    const record = await prisma.institutionProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return serializeDates(record);
  },
};
