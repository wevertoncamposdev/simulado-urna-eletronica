export const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Copia só as chaves permitidas que realmente vieram na requisição.
export const pick = (object, keys) =>
  Object.fromEntries(keys.filter((key) => Object.hasOwn(object, key)).map((key) => [key, object[key]]));

// Minúsculas e sem acentos, para buscas ("jose" encontra "José").
export const normalizeText = (value) =>
  String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
