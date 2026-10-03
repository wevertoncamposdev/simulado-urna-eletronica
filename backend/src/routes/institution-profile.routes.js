import { institutionProfileController } from '../controllers/institution-profile.controller.js';

export function registerInstitutionProfileRoutes(router) {
  router.get('/api/institution-profile', institutionProfileController.get);
  router.put('/api/institution-profile', institutionProfileController.save);
}
