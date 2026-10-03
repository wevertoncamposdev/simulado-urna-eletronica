import { publicController } from '../controllers/public.controller.js';

// Único grupo de rotas sem login: o token do link já é a autorização.
export function registerPublicRoutes(router) {
  router.get('/api/public/sessions/:token', publicController.getSession, { public: true });
  router.get('/api/public/sessions/:token/votes/lookup', publicController.lookup, { public: true });
  router.post('/api/public/sessions/:token/votes', publicController.createVote, { public: true });
  router.get('/api/public/sessions/:token/results', publicController.getResults, { public: true });
}
