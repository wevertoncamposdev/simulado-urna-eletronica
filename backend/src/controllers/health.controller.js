import { healthService } from '../services/health.service.js';
import { sendSuccess } from '../utils/http.js';

export const healthController = {
  async check({ res }) {
    sendSuccess(res, await healthService.check());
  },
};
