import { positionController } from '../controllers/position.controller.js';

export function registerPositionRoutes(router) {
  router.get('/api/positions', positionController.list);
  router.get('/api/positions/:id', positionController.get);
  router.post('/api/positions', positionController.create);
  router.put('/api/positions/:id', positionController.update);
  router.delete('/api/positions/:id', positionController.remove);
}
