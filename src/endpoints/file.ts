import FormData from 'form-data';

import { Context, Response, TableMeta } from '../types';
import { assertRespValid } from '../utils';

interface ImageItemMeta {
  height: number;
  width: number;
}

interface FileItem {
  id: string;
  link: string;
  image_meta?: ImageItemMeta;
}

export class FilesEndpoint {
  #context: Context;
  #tableMeta: TableMeta;
  constructor(context: Context, tableMeta: TableMeta) {
    this.#context = context;
    this.#tableMeta = tableMeta;
  }

  #tableUrl() {
    return `/${this.#tableMeta.resource}/table/${this.#tableMeta.tableId}`;
  }

  async upload(file: Uint8Array | Blob): Promise<FileItem> {
    const formData = new FormData();
    formData.append('file', file, {
      filename: 'file',
    });
    const data = await this.#context.axios.post<Response<FileItem>>(
      `${this.#tableUrl()}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    assertRespValid(data);
    return data.data.data;
  }
}
