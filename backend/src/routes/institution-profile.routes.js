import { institutionProfileController } from '../controllers/institution-profile.controller.js';

export function registerInstitutionProfileRoutes(router) {
  router.put('/api/institution-profile', institutionProfileController.save, { skipProfileCheck: true });
}
