import { partyService } from '../services/party.service.js';
import { sendSuccess } from '../utils/http.js';

export const partyController = {
  async list({ res, query, userId }) {
    sendSuccess(res, await partyService.list(query, userId));
  },

  async get({ res, params, userId }) {
    sendSuccess(res, await partyService.getById(params.id, userId));
  },

  async create({ res, body, userId }) {
    sendSuccess(res, await partyService.create(body, userId), 201);
  },

  async update({ res, params, body, userId }) {
    sendSuccess(res, await partyService.update(params.id, body, userId));
  },

  // DELETE desativa o registro (não apaga).
  async deactivate({ res, params, userId }) {
    sendSuccess(res, await partyService.deactivate(params.id, userId));
  },
};
