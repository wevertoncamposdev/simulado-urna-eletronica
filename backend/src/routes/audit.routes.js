import { auditController } from '../controllers/audit.controller.js';

export function registerAuditRoutes(router) {
  router.get('/api/sessions/:id/audit', auditController.get);
}
