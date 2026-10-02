import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';

// Único ponto que grava/lê os arquivos de foto em disco (paralelo ao JsonDatabase,
// mas para binários em vez de coleções JSON). Fotos ficam em backend/data/photos.
const EXTENSION_BY_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const DATA_URI_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const STORED_PATH_PATTERN = /^\/photos\/[0-9a-f-]+\.(?:jpg|png|webp)$/i;

const photoDir = () => path.join(config.dataPath, 'photos');

// Reconhece uma captura da webcam (data URI) ainda não salva em disco.
export function parsePhotoDataUri(value) {
  const match = typeof value === 'string' ? DATA_URI_PATTERN.exec(value) : null;
  if (!match) return null;
  const [, mime, base64] = match;
  return { extension: EXTENSION_BY_MIME[mime], buffer: Buffer.from(base64, 'base64') };
}

export const isStoredPhotoPath = (value) => STORED_PATH_PATTERN.test(value ?? '');

export const photoStorage = {
  async save(buffer, extension) {
    const fileName = `${randomUUID()}.${extension}`;
    await fs.mkdir(photoDir(), { recursive: true });
    await fs.writeFile(path.join(photoDir(), fileName), buffer);
    return `/photos/${fileName}`;
  },

  // Sem efeito se `storedPath` não for um caminho gerado por save() — assim é
  // seguro chamar com qualquer valor de `photo` (URL externa, nulo, etc).
  async remove(storedPath) {
    if (!isStoredPhotoPath(storedPath)) return;
    await fs.unlink(path.join(photoDir(), path.basename(storedPath))).catch(() => {});
  },

  // Usado só pelo middleware que serve os arquivos (ver middleware/photo-static.js).
  read(fileName) {
    return fs.readFile(path.join(photoDir(), fileName));
  },
};
