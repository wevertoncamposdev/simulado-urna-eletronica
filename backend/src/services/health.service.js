import { sessionRepository } from '../repositories/session.repository.js';

export const healthService = {
  async check() {
    let storage = { type: 'postgresql', ok: true };

    try {
      await sessionRepository.count(); // prova que a conexão com o banco está de pé
    } catch (error) {
      storage = { type: 'postgresql', ok: false, message: error.message };
    }

    return {
      status: storage.ok ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      storage,
    };
  },
};
