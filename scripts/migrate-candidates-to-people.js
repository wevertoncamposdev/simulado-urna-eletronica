// Migração única: antes, `candidate` guardava nome/foto diretamente; agora essa
// identidade mora em `people` (reaproveitável entre sessões) e o candidato só
// guarda `personId`. Este script adapta backend/data/*.json já existentes —
// cria uma pessoa pra cada candidato que ainda não tem `personId` e troca
// name/photo por personId no candidato. Idempotente: candidatos que já têm
// `personId` são ignorados, então rodar de novo não duplica nada.
//
// Uso: node scripts/migrate-candidates-to-people.js
// Rode com o backend parado, pra não disputar a escrita dos mesmos arquivos.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../backend/src/config.js';

async function readJson(file) {
  const filePath = path.join(config.dataPath, file);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

// Mesmo padrão do JsonDatabase: grava num arquivo temporário e renomeia, pra
// nunca deixar o arquivo pela metade se o processo for interrompido no meio.
async function writeJson(file, records) {
  const filePath = path.join(config.dataPath, file);
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(records, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);
}

async function main() {
  const candidates = await readJson('candidates.json');
  const people = await readJson('people.json');

  let migrated = 0;
  for (const candidate of candidates) {
    if (candidate.personId) continue; // já migrado

    const person = {
      id: randomUUID(),
      name: candidate.name ?? 'Sem nome',
      photo: candidate.photo ?? null,
      createdAt: candidate.createdAt ?? new Date().toISOString(),
    };
    people.push(person);
    candidate.personId = person.id;
    delete candidate.name;
    delete candidate.photo;
    migrated += 1;
  }

  if (migrated === 0) {
    console.log('Nada para migrar: todos os candidatos já têm personId.');
    return;
  }

  await writeJson('people.json', people);
  await writeJson('candidates.json', candidates);
  console.log(`Migrados ${migrated} candidato(s) para ${people.length} pessoa(s) em ${config.dataPath}.`);
}

main().catch((error) => {
  console.error('[migrate-candidates-to-people] falhou:', error);
  process.exitCode = 1;
});
