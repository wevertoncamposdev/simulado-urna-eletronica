import { resultController } from '../controllers/result.controller.js';

export function registerResultRoutes(router) {
  router.get('/api/sessions/:id/results', resultController.get);
  router.post('/api/sessions/:id/results/runoff-session', resultController.createRunoffSession);
}
