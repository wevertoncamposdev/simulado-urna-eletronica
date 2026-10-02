import { sessionRepository } from '../repositories/session.repository.js';

export const healthService = {
  async check() {
    let storage = { type: 'json', ok: true };

    try {
      await sessionRepository.count(); // prova que a cadeia Repository → JsonDatabase → arquivo funciona
    } catch (error) {
      storage = { type: 'json', ok: false, message: error.message };
    }

    return {
      status: storage.ok ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      storage,
    };
  },
};
