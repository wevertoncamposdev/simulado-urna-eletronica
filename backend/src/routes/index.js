import { Router } from '../utils/router.js';
import { registerAuditRoutes } from './audit.routes.js';
import { registerAuthRoutes } from './auth.routes.js';
import { registerCandidateRoutes } from './candidate.routes.js';
import { registerHealthRoutes } from './health.routes.js';
import { registerPartyRoutes } from './party.routes.js';
import { registerPersonRoutes } from './person.routes.js';
import { registerPositionRoutes } from './position.routes.js';
import { registerResultRoutes } from './result.routes.js';
import { registerSessionRoutes } from './session.routes.js';
import { registerVoteRoutes } from './vote.routes.js';

export function createRouter() {
  const router = new Router();
  registerHealthRoutes(router);
  registerAuthRoutes(router);
  registerPositionRoutes(router);
  registerSessionRoutes(router);
  registerPartyRoutes(router);
  registerPersonRoutes(router);
  registerCandidateRoutes(router);
  registerVoteRoutes(router);
  registerResultRoutes(router);
  registerAuditRoutes(router);
  return router;
}
