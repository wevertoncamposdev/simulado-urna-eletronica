import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/http.js';

export const authController = {
  async register({ res, body }) {
    sendSuccess(res, await authService.register(body), 201);
  },

  async login({ res, body }) {
    sendSuccess(res, await authService.login(body));
  },

  async me({ res, userId }) {
    sendSuccess(res, await authService.me(userId));
  },
};
