import { candidateController } from '../controllers/candidate.controller.js';

export function registerCandidateRoutes(router) {
  router.get('/api/candidates', candidateController.list);
  router.get('/api/candidates/:id', candidateController.get);
  router.post('/api/candidates', candidateController.create);
  router.put('/api/candidates/:id', candidateController.update);
  router.delete('/api/candidates/:id', candidateController.deactivate);
}
