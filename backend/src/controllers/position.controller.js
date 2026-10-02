import { positionService } from '../services/position.service.js';
import { sendSuccess } from '../utils/http.js';

export const positionController = {
  async list({ res, userId }) {
    sendSuccess(res, await positionService.list(userId));
  },

  async get({ res, params, userId }) {
    sendSuccess(res, await positionService.getById(params.id, userId));
  },

  async create({ res, body, userId }) {
    sendSuccess(res, await positionService.create(body, userId), 201);
  },

  async update({ res, params, body, userId }) {
    sendSuccess(res, await positionService.update(params.id, body, userId));
  },

  async remove({ res, params, userId }) {
    await positionService.remove(params.id, userId);
    sendSuccess(res, { id: params.id });
  },
};
