import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/http.js';

export function handleError(res, error) {
  if (error instanceof AppError) {
    return sendError(res, error.status, error.code, error.message);
  }

  console.error('[erro inesperado]', error);
  return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Erro interno do servidor.');
}
