import { positionService } from '../services/position.service.js';
import { sendSuccess } from '../utils/http.js';

export const positionController = {
  async list({ res }) {
    sendSuccess(res, positionService.list());
  },
};
