import { healthController } from '../controllers/health.controller.js';

export function registerHealthRoutes(router) {
  router.get('/api/health', healthController.check, { public: true });
}
