import { type Axios } from 'axios';

export type ApiVersion = 1;

export type NameType = 'name' | 'id';

export interface Context {
  token: string;
  // apiVersion: ApiVersion;
  axios: Axios;
}

export interface RepoMeta {
  resource: string; // the resource representing the repo, like "{owner}/{repoName}"
}

export interface TableMeta extends RepoMeta {
  tableId: string;
  nameType: NameType;
}

export interface RecordMeta extends TableMeta {
  recordId: string;
}

export interface FieldMeta extends TableMeta {
  fieldId: string;
}



export interface Response<T extends any> {
  code: number;
  data: T;
  error: string;
}


export interface ResponseWrapper<T extends any> {
  data: Response<T>;
}