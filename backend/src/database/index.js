import path from 'node:path';
import { config } from '../config.js';
import { JsonDatabase } from './json-database.js';

// Único ponto que sabe onde ficam os arquivos. Os repositories pedem uma "coleção" pelo nome.
export const createCollection = (name) =>
  new JsonDatabase(path.join(config.dataPath, `${name}.json`));
