import { personController } from '../controllers/person.controller.js';

export function registerPersonRoutes(router) {
  router.get('/api/people', personController.list);
  router.get('/api/people/:id', personController.get);
  router.post('/api/people', personController.create);
  router.put('/api/people/:id', personController.update);
  router.delete('/api/people/:id', personController.remove);
}
