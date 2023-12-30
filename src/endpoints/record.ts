import { Context, TableMeta, Response, NameType } from "../types";
import { assertRespValid } from "../utils";

type RecordValueType = string | number | null | string[];
export interface Record {
  fields: {
    [fieldId: string]: RecordValueType;
  };
  record_id: string;
  create_time: number;
  update_time: number;
}

export interface RecordList {
  records: Record[];
}

export interface RecordItem {
  record: Record;
}

export interface Metric {
  aggr: string;
  condition?: string;
  field: string;
}

export interface MetricData extends Metric {
  value: number;
}

export interface MetricDataList {
  metrics?: MetricData[];
  metric?: MetricData;
}

type UpdateRecord = Record["fields"];

interface RecordOrderByQuery {
  [fieldName: string]: "asc" | "desc";
}

interface RecordSelectQuery {
  fields?: string[];
  offset?: number;
  limit?: number;
}

type FieldWhereQuery =
  | { gt: any }
  | { gte: any }
  | { neq: any }
  | { lt: any }
  | { eq: any }
  | { lte: any }
  | { in: any }
  | { not_in: any }
  | { is_null: never }
  | { not_null: never }
  | { contain: any };

interface NormalWhereQuery {
  [fieldName: string]: FieldWhereQuery;
}

export interface RecordSearchQuery {
  fields: string[];
  search_fields: string[];
  query: string;
  offset?: number;
  limit?: number;
  boostFields?: {
    [fieldName: string]: number;
  };
  filter?: ServerFilter;
  order?: ServerOrderByItem;
  orders?: ServerOrderByItem[];
  name_type: NameType;
}

export interface RecordSearchQueryParams {
  where?: RecordWhereQuery;
  orderBy?: RecordOrderByQuery;
  select?: RecordSelectQuery;
  search_fields?: string[];
  query: string;
  offset?: number;
  limit?: number;
  boostFields?: {
    [fieldName: string]: number;
  };
}

export interface ANDWhereQuery {
  AND: RecordWhereQuery | RecordWhereQuery[];
}
export interface ORWhereQuery {
  OR: RecordWhereQuery[] | RecordWhereQuery;
}

export interface NotWhereQuery {
  NOT: RecordWhereQuery;
}

export type RecordWhereQuery =
  | NormalWhereQuery
  | ANDWhereQuery
  | ORWhereQuery
  | NotWhereQuery;
export type RecordWhereQueryContent =
  | FieldWhereQuery
  | RecordWhereQuery
  | RecordWhereQuery[];

interface ServerNormalFilter {
  val: RecordValueType;
  op:
    | "gt"
    | "gte"
    | "neq"
    | "lt"
    | "eq"
    | "lte"
    | "in"
    | "not_in"
    | "contain"
    | "is_null"
    | "not_null";
  field: string;
  filter_type: "single";
}

interface ServerGroupFilter {
  filters: ServerFilter[];
  filter_type: "and" | "or" | "not";
}

type ServerFilter = ServerNormalFilter | ServerGroupFilter;

interface ServerOrderByItem {
  field: string;
  order_by: "asc" | "desc";
}

interface RecordsQuery {
  fields?: string[];
  offset?: number;
  limit?: number;
  take?: number;
  skip?: number;
  filter?: ServerFilter;
  order?: ServerOrderByItem;
  orders?: ServerOrderByItem[];
  name_type: NameType;
}

interface MetricQuery {
  filter?: ServerFilter;
  metric?: Metric;
  metrics?: Metric[];
  name_type: NameType;
}

const isObject = (item: any) => item !== null && typeof item === "object";

const isNormalQuery = (name: string, content: any) => {
  if (name !== "AND" && name !== "OR" && name !== "NOT") {
    return true;
  }
  for (const key in content) {
    if (isObject(content[key])) {
      return false;
    }
  }
  return true;
};
const isORQuery = (name: string, content: any): content is RecordWhereQuery[] =>
  name === "OR" && Array.isArray(content);
const isANDQuery = (name: string, content: any): content is RecordWhereQuery =>
  name === "AND" && !isNormalQuery(name, content);
const isNotQuery = (
  name: string,
  content: any
): content is RecordWhereQuery[] => name === "NOT" && Array.isArray(content);

const getServerFilterRecursive = (
  key: string,
  content: RecordWhereQueryContent
): ServerFilter => {
  if (isANDQuery(key, content)) {
    return {
      filter_type: "and",
      filters: Object.entries(content).map(([childKey, childContent]) => {
        return getServerFilterRecursive(
          childKey,
          childContent satisfies RecordWhereQueryContent
        );
      }),
    };
  }
  if (isORQuery(key, content)) {
    return {
      filter_type: "or",
      filters: content.map((item) => {
        return getServerFilterRecursive("AND", item);
      }),
    };
  }
  if (isNotQuery(key, content)) {
    return {
      filter_type: "not",
      filters: content.map((item) => {
        return getServerFilterRecursive("AND", item);
      }),
    };
  }
  return {
    filter_type: "single",
    field: key,
    op: Object.keys(content as FieldWhereQuery)[0] as keyof FieldWhereQuery,
    val: Object.values(content as FieldWhereQuery)[0],
  };
};

const getServerFilterFromQuery = (
  whereQuery: RecordWhereQuery | undefined
): ServerFilter | null => {
  if (!whereQuery) {
    return null;
  }

  const rootKeys = Object.keys(whereQuery);
  if (rootKeys.length < 1) {
    return null;
  }
  if (rootKeys.length > 1) {
    return getServerFilterRecursive("AND", whereQuery);
  }
  const key = rootKeys[0]!;
  const content = whereQuery[
    key as keyof RecordWhereQuery
  ] satisfies RecordWhereQueryContent;
  return getServerFilterRecursive(key, content);
};

const getServerOrderByQuery = (
  orderBy: RecordOrderByQuery | undefined
): Pick<RecordsQuery, "order" | "orders"> | null => {
  if (!orderBy) {
    return null;
  }

  const serverItems: ServerOrderByItem[] = [];
  for (const key in orderBy) {
    serverItems.push({
      field: key,
      order_by: orderBy[key] as RecordOrderByQuery[keyof RecordOrderByQuery],
    });
  }

  if (serverItems.length < 1) {
    return null;
  }
  return serverItems.length === 1
    ? { order: serverItems[0] }
    : { orders: serverItems };
};

export class RecordsEndpoint {
  #context: Context;
  #tableMeta: TableMeta;
  constructor(context: Context, tableMeta: TableMeta) {
    this.#context = context;
    this.#tableMeta = tableMeta;
  }

  #tableUrl() {
    return `/${this.#tableMeta.resource}/table/${this.#tableMeta.tableId}`;
  }

  /**
   * @description Find a record by id
   * @example
   * ```ts
   * const record = await api.repos('repoId').table('tableId').records.findById('recordId');
   * ```
   * @param id: string, the id of the record
   * @returns Record
   */
  async findById(id: string): Promise<Record> {
    const data = await this.#context.axios.get<Response<RecordItem>>(
      `${this.#tableUrl()}/record/${id}`,
      {
        params: {
          name_type: this.#tableMeta.nameType,
        },
      }
    );
    assertRespValid(data);
    return data.data.data.record;
  }

  /**
   * @description Find multiple records
   * @example
   * ```ts
   * const records = await api.repos('repoId').table('tableId').records.findMany({
   * where: {
   *  AND: {
   *   field1: { gt: 1 },
   *  field2: { lt: 2 },
   * },
   * orderBy: {
   * field1: 'asc',
   * field2: 'desc',
   * },
   * select: {
   * field1: true,
   * field2: true,
   * },
   * });
   * ```
   * @param param.where: RecordWhereQuery, the where query
   * @param param.orderBy: RecordOrderByQuery, the order by query
   * @param param.select: RecordSelectQuery, the select query
   * @returns Record[]
   * @throws ApiError
   * @memberof RecordsEndpoint
   * @throws {ApiError}
   */
  async findMany(param?: {
    where?: RecordWhereQuery;
    orderBy?: RecordOrderByQuery;
    select?: RecordSelectQuery;
    skip?: number;
    take?: number;
  }): Promise<Record[]> {
    if (!param) {
      param = {};
    }

    let query: RecordsQuery = {
      ...param.select,
      name_type: this.#tableMeta.nameType,
    };

    const filter = getServerFilterFromQuery(param.where);
    if (filter) {
      query.filter = filter;
    }

    const orderBy = getServerOrderByQuery(param.orderBy);
    if (orderBy) {
      query = { ...query, ...orderBy };
    }

    const data = await this.#context.axios.post<Response<RecordList>>(
      `${this.#tableUrl()}/record/query`,
      query
    );
    assertRespValid(data);
    return data.data.data.records;
  }

  /**
   * @description get count of records
   * @example
   * ```ts
   * const count = await api.repos('repoId').table('tableId').records.count({
   * where: {
   * AND: {
   * field1: { gt: 1 },
   * field2: { lt: 2 },
   * },
   * distinct: true,
   * });
   * ```
   * @param param.where: RecordWhereQuery, the where query
   * @param param.distinct: boolean, whether to count distinct records
   * @returns number
   */
  async count(param?: {
    where?: RecordWhereQuery;
    distinct?: boolean;
  }): Promise<number> {
    let query: MetricQuery = { name_type: this.#tableMeta.nameType };

    query = {
      ...query,
      metric: {
        aggr: "count",
        field: "*",
      },
    };

    if (param) {
      if (param.where) {
        const filter = getServerFilterFromQuery(param.where);
        if (filter) {
          query.filter = filter;
        }
      }
      if (param.distinct) {
        query.metric = {
          aggr: "count",
          field: "*",
          condition: "distinct",
        };
      }
    }

    const data = await this.#context.axios.post<Response<MetricDataList>>(
      `${this.#tableUrl()}/record/metrics`,
      query
    );
    assertRespValid(data);
    return data.data.data.metric?.value || 0;
  }

  async first(param: {
    where?: RecordWhereQuery;
    orderBy?: RecordOrderByQuery;
    select?: RecordSelectQuery;
  }): Promise<Record | null> {
    let query: RecordsQuery = {
      ...param.select,
      name_type: this.#tableMeta.nameType,
    };

    const filter = getServerFilterFromQuery(param.where);
    if (filter) {
      query.filter = filter;
    }

    const orderBy = getServerOrderByQuery(param.orderBy);
    if (orderBy) {
      query = { ...query, ...orderBy };
    }

    query = {
      ...query,
      limit: 1,
    };

    const data = await this.#context.axios.post<Response<Record[]>>(
      `${this.#tableUrl()}/record/query`,
      query
    );
    assertRespValid(data);
    if (data.data.data[0]) {
      return data.data.data[0];
    }
    return null;
  }

  async create(record: UpdateRecord) {
    const data = await this.#context.axios.post(`${this.#tableUrl()}/record`, {
      record,
      name_type: this.#tableMeta.nameType,
    });
    assertRespValid(data);
    return data.data.data;
  }

  async createMany(records: UpdateRecord[]) {
    const data = await this.#context.axios.post(`${this.#tableUrl()}/record`, {
      records,
      name_type: this.#tableMeta.nameType,
    });
    assertRespValid(data);
    return data.data.data;
  }

  async updateById(param: { id: string; data: UpdateRecord }): Promise<void> {
    const data = await this.#context.axios.put(
      `${this.#tableUrl()}/record/${param.id}`,
      {
        fields: param.data,
        name_type: this.#tableMeta.nameType,
      }
    );
    assertRespValid(data);
    return data.data.data;
  }

  async updateMany(param: {
    where?: RecordWhereQuery;
    data: UpdateRecord;
  }): Promise<void> {
    const putData: {
      filter?: ServerFilter;
      fields: UpdateRecord;
      name_type: NameType;
    } = {
      fields: param.data,
      name_type: this.#tableMeta.nameType,
    };

    const filter = getServerFilterFromQuery(param.where);
    if (filter) {
      putData.filter = filter;
    }

    const data = await this.#context.axios.put(
      `${this.#tableUrl()}/record`,
      putData
    );
    assertRespValid(data);
    return data.data;
  }

  async deleteById(id: string): Promise<void> {
    const data = await this.#context.axios.delete(
      `${this.#tableUrl()}/record/${id}`
    );
    assertRespValid(data);
    return data.data;
  }

  async deleteMany(param: { where?: RecordWhereQuery }): Promise<void> {
    const query: { filter?: ServerFilter; name_type: NameType } = {
      name_type: this.#tableMeta.nameType,
    };

    const filter = getServerFilterFromQuery(param.where);
    if (filter) {
      query.filter = filter;
    }

    const data = await this.#context.axios.delete(
      `${this.#tableUrl()}/record`,
      { data: query }
    );
    assertRespValid(data);
    return data.data;
  }

  /**
   * @description search multiple records
   * ```
   * @param param: RecordSearchQuery, the where query
   * @returns Record[]
   * @throws ApiError
   * @memberof RecordsEndpoint
   * @throws {ApiError}
   */
  async search(param: RecordSearchQueryParams): Promise<Record[]> {
    let query: RecordSearchQuery = {
      name_type: this.#tableMeta.nameType,
      search_fields: param.search_fields || [],
      offset: param.offset,
      limit: param.limit,
      boostFields: param.boostFields,
      query: param.query,
      fields: param.select?.fields || [],
    };

    const filter = getServerFilterFromQuery(param.where);
    if (filter) {
      query.filter = filter;
    }

    const orderBy = getServerOrderByQuery(param.orderBy);
    if (orderBy) {
      query = { ...query, ...orderBy };
    }

    const data = await this.#context.axios.post<Response<RecordList>>(
      `${this.#tableUrl()}/record/search`,
      query
    );
    assertRespValid(data);
    return data.data.data.records;
  }
}
