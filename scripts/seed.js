// Preenche backend/data/*.json com uma eleição fictícia para testes manuais.
// Usa os services (não grava JSON direto), então passa pelas mesmas validações da API.
// Uso: node scripts/seed.js [--voters=N] [--finish]
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../backend/src/config.js';
import { sessionService } from '../backend/src/services/session.service.js';
import { partyService } from '../backend/src/services/party.service.js';
import { candidateService } from '../backend/src/services/candidate.service.js';
import { voteService } from '../backend/src/services/vote.service.js';

const PARTIES = [
  { name: 'Partido ABC', acronym: 'ABC', number: 10 },
  { name: 'Partido XYZ', acronym: 'XYZ', number: 20 },
  { name: 'Partido DEMO', acronym: 'DEMO', number: 30 },
];

const CANDIDATES_BY_POSITION = {
  PRESIDENTE: [
    { name: 'João Silva', number: '10' },
    { name: 'Maria Souza', number: '20' },
    { name: 'Carlos Oliveira', number: '30' },
  ],
  GOVERNADOR: [
    { name: 'Ana Santos', number: '11' },
    { name: 'Pedro Lima', number: '22' },
    { name: 'Lúcia Ramos', number: '33' },
  ],
  SENADOR: [
    { name: 'Rafael Costa', number: '101' },
    { name: 'Beatriz Alves', number: '202' },
    { name: 'Tiago Mendes', number: '303' },
  ],
};

// Gerador pseudoaleatório de semente fixa, para a simulação ser reprodutível.
function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(argv) {
  const voters = argv.find((arg) => arg.startsWith('--voters='));
  return {
    voters: voters ? Number(voters.slice('--voters='.length)) : 0,
    finish: argv.includes('--finish'),
  };
}

async function clearData() {
  await fs.mkdir(config.dataPath, { recursive: true });
  await Promise.all(
    ['sessions', 'parties', 'candidates', 'votes'].map((name) =>
      fs.writeFile(path.join(config.dataPath, `${name}.json`), '[]\n', 'utf-8'),
    ),
  );
  // Sem candidatos antigos, as fotos que eles tinham em disco ficariam órfãs.
  await fs.rm(path.join(config.dataPath, 'photos'), { recursive: true, force: true });
}

async function createParties() {
  const partiesByAcronym = new Map();
  for (const data of PARTIES) {
    const party = await partyService.create(data);
    partiesByAcronym.set(party.acronym, party);
  }
  return partiesByAcronym;
}

async function createCandidates(sessionId, partiesByAcronym) {
  const parties = [...partiesByAcronym.values()];
  for (const [position, candidates] of Object.entries(CANDIDATES_BY_POSITION)) {
    for (const [index, candidate] of candidates.entries()) {
      await candidateService.create({
        sessionId,
        partyId: parties[index % parties.length].id,
        position,
        name: candidate.name,
        number: candidate.number,
      });
    }
  }
}

// Decide o tipo de voto (80% válido, 10% branco, 10% nulo) e, se válido, o candidato.
function pickVote(random, position) {
  const roll = random();
  if (roll < 0.8) {
    const candidates = CANDIDATES_BY_POSITION[position];
    const candidate = candidates[Math.floor(random() * candidates.length)];
    return { type: 'VALID', number: candidate.number };
  }
  if (roll < 0.9) return { type: 'BLANK' };
  return { type: 'NULL' };
}

async function castVotes(sessionId, voters, random) {
  const positions = Object.keys(CANDIDATES_BY_POSITION);
  let count = 0;
  for (let voter = 0; voter < voters; voter += 1) {
    for (const position of positions) {
      const vote = pickVote(random, position);
      await voteService.create({ sessionId, position, confirmed: true, ...vote });
      count += 1;
    }
  }
  return count;
}

async function main() {
  const { voters, finish } = parseArgs(process.argv.slice(2));

  await clearData();
  const partiesByAcronym = await createParties();

  const session = await sessionService.create({
    name: 'Eleição Demo 2026',
    year: 2026,
    positions: Object.keys(CANDIDATES_BY_POSITION),
  });
  await createCandidates(session.id, partiesByAcronym);
  await sessionService.open(session.id);

  let votesCast = 0;
  if (voters > 0) {
    votesCast = await castVotes(session.id, voters, mulberry32(42));
  }

  if (finish) {
    await sessionService.finish(session.id);
  }

  console.log(`Dados em ${config.dataPath}`);
  console.log(`Partidos criados: ${partiesByAcronym.size}`);
  console.log(`Sessão "${session.name}" (${session.id}), cargos: ${session.positions.join(', ')}`);
  console.log(`Candidatos criados: ${Object.values(CANDIDATES_BY_POSITION).flat().length}`);
  console.log(`Votos simulados: ${votesCast}`);
  console.log(`Sessão finalizada: ${finish ? 'sim' : 'não'}`);
}

main().catch((error) => {
  console.error('[seed] falhou:', error);
  process.exitCode = 1;
});
