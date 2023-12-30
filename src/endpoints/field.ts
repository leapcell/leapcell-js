import { Context, TableMeta } from '../types';

export class FieldsEndpoint {
  #context: Context;
  #tableMeta: TableMeta;
  constructor(context: Context, tableMeta: TableMeta) {
    this.#context = context;
    this.#tableMeta = tableMeta;
  }
}
