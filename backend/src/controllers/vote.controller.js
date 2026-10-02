import { voteService } from '../services/vote.service.js';
import { sendSuccess } from '../utils/http.js';

export const voteController = {
  async create({ res, body, userId }) {
    sendSuccess(res, await voteService.create(body, userId), 201);
  },

  async lookup({ res, query, userId }) {
    sendSuccess(res, await voteService.lookup(query, userId));
  },
};
