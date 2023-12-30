import { Context, NameType, RepoMeta } from '../types';

import { TablesEndpoint } from './table';

export class ReposEndpoint {
  #context: Context;
  constructor(context: Context) {
    this.#context = context;
  }

  static createInst(context: Context, meta: RepoMeta) {
    return new Repo(context, meta);
  }
}

export class Repo {
  #context: Context;
  #meta: RepoMeta;
  constructor(context: Context, meta: RepoMeta) {
    this.#context = context;
    this.#meta = meta;
  }

  #tables: TablesEndpoint | undefined;
  get tables() {
    return this.#tables || (this.#tables = new TablesEndpoint(this.#context));
  }

  /**
   * @example
   * ```ts
   * const table = api.repos('repoId').table('tableId');
   * ```
   * @param {string} tableId - The id of the table
   * @param {NameType} nameType - The type of the name to use, either 'id' or 'name'
   * @returns {TablesEndpoint}
   * @memberof LeapcellApi
   */
  table(tableId: string, nameType: NameType = 'name') {
    return TablesEndpoint.createInst(this.#context, { ...this.#meta, tableId, nameType });
  }
}
