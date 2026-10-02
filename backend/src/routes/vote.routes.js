import { voteController } from '../controllers/vote.controller.js';

export function registerVoteRoutes(router) {
  router.get('/api/votes/lookup', voteController.lookup);
  router.post('/api/votes', voteController.create);
}
