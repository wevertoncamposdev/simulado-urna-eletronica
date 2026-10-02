import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  dataPath: process.env.DATA_PATH
    ? path.resolve(process.env.DATA_PATH)
    : path.join(backendRoot, 'data'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
