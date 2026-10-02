import { photoStorage } from '../storage/photo-storage.js';

const FILENAME_PATTERN = /^[0-9a-f-]+\.(jpg|png|webp)$/i;
const CONTENT_TYPE = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// Serve as fotos de candidatos capturadas pela webcam (backend/data/photos).
// Não é um framework de arquivos estáticos: só aceita o formato exato de nome
// gerado por photoStorage.save, então não há risco de path traversal.
export async function servePhoto(res, pathname) {
  const fileName = pathname.slice('/photos/'.length);
  if (!FILENAME_PATTERN.test(fileName)) {
    res.writeHead(404).end();
    return;
  }

  const extension = fileName.split('.').pop().toLowerCase();
  try {
    const data = await photoStorage.read(fileName);
    res.writeHead(200, {
      'Content-Type': CONTENT_TYPE[extension],
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.end(data);
  } catch {
    res.writeHead(404).end();
  }
}
