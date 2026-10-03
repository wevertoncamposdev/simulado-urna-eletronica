import { PrismaClient } from '@prisma/client';

// Único ponto que conhece o cliente do banco. Repositories importam `prisma` de
// aqui — nunca instanciam PrismaClient diretamente (evita abrir uma conexão nova
// por import, principalmente sob `node --watch`).
export const prisma = new PrismaClient();

// Services/controllers esperam `createdAt`/`startedAt`/etc. como string ISO (ex.:
// `session.createdAt.localeCompare(...)`), igual ao JsonDatabase antigo. O Prisma
// devolve objetos Date — esta função converte de volta antes de qualquer record
// sair de um repository, pra não precisar tocar em nenhum service.
export function serializeDates(record) {
  if (!record) return record;
  const result = { ...record };
  for (const [key, value] of Object.entries(result)) {
    if (value instanceof Date) result[key] = value.toISOString();
  }
  return result;
}

export const serializeAll = (records) => records.map(serializeDates);

// Mapeia a violação de UNIQUE constraint do Postgres (código P2002) para o mesmo
// formato de conflito que o JsonDatabase usava (insertUnless/updateUnless), sem
// precisar mudar nenhum service. `fieldToConflict` liga o nome do campo que
// colidiu (Prisma manda em error.meta.target) ao código de conflito esperado.
export function isUniqueViolation(error) {
  return error?.code === 'P2002';
}

export function conflictFieldFrom(error, fieldToConflict) {
  const target = error?.meta?.target ?? [];
  const fields = Array.isArray(target) ? target : String(target).split(',').map((s) => s.trim());
  for (const [field, conflict] of Object.entries(fieldToConflict)) {
    if (fields.some((t) => t.includes(field))) return conflict;
  }
  return null;
}

// Serializa todo acesso de escrita/leitura-para-decisão da coleção de sessões numa
// fila só-um-de-cada-vez — mesmo papel que o #queue do JsonDatabase cumpria, usado
// por vote.service pra garantir que nenhuma finalização de sessão concorrente deixe
// passar um voto depois de completada (ver sessionRepository.withLock).
let sessionQueue = Promise.resolve();
export function enqueueSessionTask(task) {
  const result = sessionQueue.then(task);
  sessionQueue = result.catch(() => {});
  return result;
}
