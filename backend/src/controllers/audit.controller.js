import { auditService } from '../services/audit.service.js';
import { sendSuccess } from '../utils/http.js';

export const auditController = {
  async get({ res, params }) {
    sendSuccess(res, await auditService.getBySession(params.id));
  },
};
