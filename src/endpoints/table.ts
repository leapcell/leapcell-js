import { Context, TableMeta, Response } from '../types';
import { assertRespValid } from '../utils';

import { RecordsEndpoint } from './record';
import { FieldsEndpoint } from './field';
import { FilesEndpoint } from './file';

export class TablesEndpoint {
  #context: Context;
  constructor(context: Context) {
    this.#context = context;
  }

  static createInst(context: Context, meta: TableMeta) {
    return new Table(context, meta);
  }
}

export interface TableMetadata {
  fields: {
    [fieldName: string]: {
      id: string;
      name: string;
      type: string;
    };
  };
}

class Table {
  #context: Context;
  #meta: TableMeta;
  constructor(context: Context, meta: TableMeta) {
    this.#context = context;
    this.#meta = meta;
  }

  /**
   * @example
   * ```ts
   * const metadata = await api.repos('repoId').table('tableId').getMetadata();
   * ```
   * @returns {Promise<TableMetadata>}
   * @memberof Table
   * @throws {ApiError}
   */
  async meta(): Promise<TableMetadata> {
    const data = await this.#context.axios.get<Response<TableMetadata>>(
      `/${this.#meta.resource}/table/${this.#meta.tableId}`,
      {
        params: {
          name_type: this.#meta.nameType,
        },
      }
    );
    assertRespValid(data);
    return data.data.data;
  }

  #records: RecordsEndpoint | undefined;
  get records() {
    return this.#records || (this.#records = new RecordsEndpoint(this.#context, this.#meta));
  }

  #file: FilesEndpoint | undefined;
  get file() {
    return this.#file || (this.#file = new FilesEndpoint(this.#context, this.#meta));
  }

  #fields: FieldsEndpoint | undefined;
  get fields() {
    return this.#fields || (this.#fields = new FieldsEndpoint(this.#context, this.#meta));
  }
}
