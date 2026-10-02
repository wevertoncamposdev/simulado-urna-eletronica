import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Sem JWT_SECRET definido, cai num valor fixo de desenvolvimento — tokens emitidos
// assim não devem ser considerados seguros fora da máquina local.
const DEV_JWT_SECRET = 'dev-only-insecure-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn('[config] JWT_SECRET não definido — usando segredo de desenvolvimento (não use em produção).');
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  dataPath: process.env.DATA_PATH
    ? path.resolve(process.env.DATA_PATH)
    : path.join(backendRoot, 'data'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || DEV_JWT_SECRET,
};
