import { resultService } from '../services/result.service.js';
import { sendSuccess } from '../utils/http.js';

export const resultController = {
  async get({ res, params }) {
    sendSuccess(res, await resultService.getBySession(params.id));
  },
};
