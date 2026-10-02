import http from 'node:http';
import { config } from './config.js';
import { createRouter } from './routes/index.js';
import { applyCors } from './middleware/cors.js';
import { handleError } from './middleware/error-handler.js';
import { servePhoto } from './middleware/photo-static.js';
import { readJsonBody, sendError } from './utils/http.js';

const router = createRouter();

async function handleRequest(req, res) {
  if (applyCors(req, res)) return;

  try {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

    if (req.method === 'GET' && url.pathname.startsWith('/photos/')) {
      return servePhoto(res, url.pathname);
    }

    const match = router.match(req.method, url.pathname);

    if (!match) {
      return sendError(res, 404, 'ROUTE_NOT_FOUND', 'Rota não encontrada.');
    }

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
    const body = hasBody ? await readJsonBody(req) : {};

    await match.handler({
      req,
      res,
      params: match.params,
      query: Object.fromEntries(url.searchParams),
      body,
    });
  } catch (error) {
    handleError(res, error);
  }
}

const server = http.createServer(handleRequest);

server.listen(config.port, config.host, () => {
  console.log(`API em http://${config.host}:${config.port}`);
  console.log(`Dados em ${config.dataPath}`);
});
