import { Resend } from 'resend';
import { config } from '../config.js';
import { EMAIL_VERIFICATION_RULES } from '../rules/email-verification-rules.js';
import { PASSWORD_RESET_RULES } from '../rules/password-reset-rules.js';

// Único ponto que conhece o SDK do Resend — services nunca importam `resend` direto,
// mesmo princípio já usado pra Prisma (database/index.js) e fotos (storage/photo-storage.js).
const resend = new Resend(config.resendApiKey);

export const emailService = {
  async sendVerificationCode(to, code) {
    await resend.emails.send({
      from: `${config.emailFromName} <${config.emailFromAddress}>`,
      to,
      subject: 'Confirme seu e-mail — UrnaLab',
      html: `
        <p>Seu código de confirmação é:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>Ele vale por ${EMAIL_VERIFICATION_RULES.ttlMinutes} minutos. Se você não pediu esse
        código, pode ignorar este e-mail.</p>
      `,
    });
  },

  async sendPasswordResetLink(to, resetUrl) {
    await resend.emails.send({
      from: `${config.emailFromName} <${config.emailFromAddress}>`,
      to,
      subject: 'Redefinição de senha — UrnaLab',
      html: `
        <p>Clique no link abaixo para definir uma nova senha. Ele vale por
        ${PASSWORD_RESET_RULES.ttlMinutes} minutos.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Se você não pediu isso, ignore este e-mail — sua senha atual continua válida.</p>
      `,
    });
  },
};
