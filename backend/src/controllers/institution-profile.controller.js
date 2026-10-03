import { institutionProfileService } from '../services/institution-profile.service.js';
import { sendSuccess } from '../utils/http.js';

export const institutionProfileController = {
  async save({ res, body, userId }) {
    sendSuccess(res, await institutionProfileService.save(body, userId));
  },
};
