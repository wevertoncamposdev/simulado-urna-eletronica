import { resultController } from '../controllers/result.controller.js';

export function registerResultRoutes(router) {
  router.get('/api/sessions/:id/results', resultController.get);
}
