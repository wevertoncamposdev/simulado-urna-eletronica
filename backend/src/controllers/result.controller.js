import { resultService } from '../services/result.service.js';
import { sendSuccess } from '../utils/http.js';

export const resultController = {
  async get({ res, params, userId }) {
    sendSuccess(res, await resultService.getBySession(params.id, userId));
  },

  async createRunoffSession({ res, params, userId }) {
    sendSuccess(res, await resultService.createRunoffSession(params.id, userId), 201);
  },
};
