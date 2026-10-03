import { prisma, serializeDates } from '../database/index.js';

export const passwordResetRepository = {
  async findByUserId(userId) {
    return serializeDates(await prisma.passwordResetToken.findUnique({ where: { userId } }));
  },

  async findByTokenHash(tokenHash) {
    return serializeDates(await prisma.passwordResetToken.findUnique({ where: { tokenHash } }));
  },

  // Pedir reset de novo sobrescreve o token pendente (userId é @unique) — nunca acumula
  // mais de um token ativo por conta.
  async upsertForUser(userId, { tokenHash, expiresAt }) {
    const record = await prisma.passwordResetToken.upsert({
      where: { userId },
      create: { userId, tokenHash, expiresAt },
      update: { tokenHash, expiresAt, createdAt: new Date() },
    });
    return serializeDates(record);
  },

  async deleteByUserId(userId) {
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
  },
};
