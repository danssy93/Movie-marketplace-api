/*eslint-disable @typescript-eslint/no-explicit-any*/
import { FindOptionsWhere, FindManyOptions, OrderByCondition } from 'typeorm';

export interface QueryString {
  sort?: string;
  fields?: string;
  page?: string;
  limit?: string;
  search?: string;
  [key: string]: any;
}

export interface QueryResult<T> {
  result: T[];
  count: number;
}

export interface QueryOptions extends Omit<
  FindManyOptions,
  'where' | 'select' | 'order'
> {
  where: FindOptionsWhere<any>;
  select?: string[];
  take?: number;
  skip?: number;
  order?: OrderByCondition;
}
