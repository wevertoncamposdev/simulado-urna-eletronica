import fs from 'node:fs/promises';
import path from 'node:path';
import { generateId } from '../utils/id.js';

/**
 * Persistência em um único arquivo JSON (um array de registros).
 *
 * Segurança de gravação:
 *  - toda operação entra numa fila (uma por vez), então duas requisições
 *    simultâneas nunca fazem "ler → alterar → gravar" ao mesmo tempo;
 *  - a gravação é atômica: escreve num arquivo temporário e renomeia.
 */
export class JsonDatabase {
  #filePath;
  #queue = Promise.resolve();

  constructor(filePath) {
    this.#filePath = filePath;
  }

  #enqueue(task) {
    const result = this.#queue.then(task);
    this.#queue = result.catch(() => {}); // um erro não trava a fila
    return result;
  }

  async #read() {
    try {
      const raw = await fs.readFile(this.#filePath, 'utf-8');
      return raw.trim() ? JSON.parse(raw) : [];
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async #write(records) {
    await fs.mkdir(path.dirname(this.#filePath), { recursive: true });
    const tempPath = `${this.#filePath}.${process.pid}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(records, null, 2), 'utf-8');
    await fs.rename(tempPath, this.#filePath);
  }

  findAll() {
    return this.#enqueue(() => this.#read());
  }

  async findById(id) {
    const records = await this.findAll();
    return records.find((record) => record.id === id) ?? null;
  }

  async findWhere(predicate) {
    const records = await this.findAll();
    return records.filter(predicate);
  }

  insert(data) {
    return this.#enqueue(async () => {
      const records = await this.#read();
      const record = { id: generateId(), ...data };
      records.push(record);
      await this.#write(records);
      return record;
    });
  }

  update(id, data) {
    return this.#enqueue(async () => {
      const records = await this.#read();
      const index = records.findIndex((record) => record.id === id);
      if (index === -1) return null;

      records[index] = { ...records[index], ...data, id };
      await this.#write(records);
      return records[index];
    });
  }

  /**
   * Insere somente se `findConflict(records)` não encontrar conflito.
   * Checar e gravar acontecem na mesma vez da fila, então duas requisições
   * simultâneas nunca criam registros duplicados.
   * Retorna { record } ou { conflict }.
   */
  insertUnless(data, findConflict) {
    return this.#enqueue(async () => {
      const records = await this.#read();
      const conflict = findConflict(records);
      if (conflict) return { conflict };

      const record = { id: generateId(), ...data };
      records.push(record);
      await this.#write(records);
      return { record };
    });
  }

  /** Atualiza somente se `findConflict(records, merged)` não encontrar conflito. */
  updateUnless(id, data, findConflict) {
    return this.#enqueue(async () => {
      const records = await this.#read();
      const index = records.findIndex((record) => record.id === id);
      if (index === -1) return { notFound: true };

      const merged = { ...records[index], ...data, id };
      const conflict = findConflict(records, merged);
      if (conflict) return { conflict };

      records[index] = merged;
      await this.#write(records);
      return { record: merged };
    });
  }

  /**
   * Executa `task` com exclusividade nesta fila, recebendo `{ read }` para ler o
   * estado atual sem reentrar na fila (reentrar causaria deadlock). Permite checar
   * e gravar atomicamente em relação a outras operações desta mesma coleção — ex.:
   * vote.service usa isto para não deixar passar um voto que uma finalização de
   * sessão concorrente já teria tornado inválido.
   */
  runExclusive(task) {
    return this.#enqueue(() => task({ read: () => this.#read() }));
  }

  delete(id) {
    return this.#enqueue(async () => {
      const records = await this.#read();
      const remaining = records.filter((record) => record.id !== id);
      if (remaining.length === records.length) return false;

      await this.#write(remaining);
      return true;
    });
  }
}
