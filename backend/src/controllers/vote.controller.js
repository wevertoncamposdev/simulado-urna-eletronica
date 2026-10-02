import { voteService } from '../services/vote.service.js';
import { sendSuccess } from '../utils/http.js';

export const voteController = {
  async create({ res, body }) {
    sendSuccess(res, await voteService.create(body), 201);
  },

  async lookup({ res, query }) {
    sendSuccess(res, await voteService.lookup(query));
  },
};
