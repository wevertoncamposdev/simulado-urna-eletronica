import { candidateService } from '../services/candidate.service.js';
import { sendSuccess } from '../utils/http.js';

export const candidateController = {
  async list({ res, query }) {
    sendSuccess(res, await candidateService.list(query));
  },

  async get({ res, params }) {
    sendSuccess(res, await candidateService.getById(params.id));
  },

  async create({ res, body }) {
    sendSuccess(res, await candidateService.create(body), 201);
  },

  async update({ res, params, body }) {
    sendSuccess(res, await candidateService.update(params.id, body));
  },

  // DELETE desativa o registro (não apaga).
  async deactivate({ res, params }) {
    sendSuccess(res, await candidateService.deactivate(params.id));
  },
};
