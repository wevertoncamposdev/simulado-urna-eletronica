import { authController } from '../controllers/auth.controller.js';

export function registerAuthRoutes(router) {
  router.post('/api/auth/register', authController.register, { public: true });
  router.post('/api/auth/login', authController.login, { public: true });
  router.get('/api/auth/me', authController.me);
}
