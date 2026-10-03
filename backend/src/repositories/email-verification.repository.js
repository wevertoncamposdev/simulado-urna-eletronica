import { prisma, serializeDates } from '../database/index.js';

export const emailVerificationRepository = {
  async findByUserId(userId) {
    return serializeDates(await prisma.emailVerificationCode.findUnique({ where: { userId } }));
  },

  // Reenviar sobrescreve o código pendente (userId é @unique) — nunca acumula mais de
  // um código ativo por conta.
  async upsertForUser(userId, { codeHash, expiresAt }) {
    const record = await prisma.emailVerificationCode.upsert({
      where: { userId },
      create: { userId, codeHash, expiresAt },
      update: { codeHash, expiresAt, attempts: 0, createdAt: new Date() },
    });
    return serializeDates(record);
  },

  async incrementAttempts(id) {
    await prisma.emailVerificationCode.update({ where: { id }, data: { attempts: { increment: 1 } } });
  },

  async deleteByUserId(userId) {
    await prisma.emailVerificationCode.deleteMany({ where: { userId } });
  },
};
