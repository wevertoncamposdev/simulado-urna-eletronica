import { authController } from '../controllers/auth.controller.js';

export function registerAuthRoutes(router) {
  router.post('/api/auth/register', authController.register, { public: true });
  router.post('/api/auth/login', authController.login, { public: true });
  router.post('/api/auth/verify-email', authController.verifyEmail, { public: true });
  router.post('/api/auth/resend-verification', authController.resendVerification, { public: true });
  router.post('/api/auth/forgot-password', authController.forgotPassword, { public: true });
  router.post('/api/auth/reset-password', authController.resetPassword, { public: true });
  router.get('/api/auth/me', authController.me, { skipProfileCheck: true });
}
