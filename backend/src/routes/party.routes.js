import { partyController } from '../controllers/party.controller.js';

export function registerPartyRoutes(router) {
  router.get('/api/parties', partyController.list);
  router.get('/api/parties/:id', partyController.get);
  router.post('/api/parties', partyController.create);
  router.put('/api/parties/:id', partyController.update);
  router.delete('/api/parties/:id', partyController.deactivate);
}
