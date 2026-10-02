import { sessionService } from '../services/session.service.js';
import { sendSuccess } from '../utils/http.js';

export const sessionController = {
  async list({ res }) {
    sendSuccess(res, await sessionService.list());
  },

  async get({ res, params }) {
    sendSuccess(res, await sessionService.getById(params.id));
  },

  async create({ res, body }) {
    sendSuccess(res, await sessionService.create(body), 201);
  },

  async update({ res, params, body }) {
    sendSuccess(res, await sessionService.update(params.id, body));
  },

  async open({ res, params }) {
    sendSuccess(res, await sessionService.open(params.id));
  },

  async finish({ res, params }) {
    sendSuccess(res, await sessionService.finish(params.id));
  },
};
