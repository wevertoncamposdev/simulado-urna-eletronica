import { positionController } from '../controllers/position.controller.js';

export function registerPositionRoutes(router) {
  router.get('/api/positions', positionController.list);
}
