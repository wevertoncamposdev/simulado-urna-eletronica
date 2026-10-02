import { partyService } from '../services/party.service.js';
import { sendSuccess } from '../utils/http.js';

export const partyController = {
  async list({ res, query }) {
    sendSuccess(res, await partyService.list(query));
  },

  async get({ res, params }) {
    sendSuccess(res, await partyService.getById(params.id));
  },

  async create({ res, body }) {
    sendSuccess(res, await partyService.create(body), 201);
  },

  async update({ res, params, body }) {
    sendSuccess(res, await partyService.update(params.id, body));
  },

  // DELETE desativa o registro (não apaga).
  async deactivate({ res, params }) {
    sendSuccess(res, await partyService.deactivate(params.id));
  },
};
