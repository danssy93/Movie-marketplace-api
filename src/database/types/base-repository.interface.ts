import {
  DeepPartial,
  FindOptionsWhere,
  FindManyOptions,
  QueryRunner,
  FindOneOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IBaseRepository<T> {
  create(data: DeepPartial<T>, queryRunner?: QueryRunner): Promise<T>;

  // createMany(data: DeepPartial<T>[], queryRunner?: QueryRunner): Promise<T[]>;
  createMany(data: DeepPartial<T>[], queryRunner?: QueryRunner): Promise<void>;

  findOne(
    where: FindOptionsWhere<T>,
    options?: Omit<FindOneOptions<T>, 'where'>,
  ): Promise<T | null>;

  find(options?: FindManyOptions<T>): Promise<T[]>;

  update(
    filterQuery: FindOptionsWhere<T>,
    update: QueryDeepPartialEntity<T>,
    queryRunner?: QueryRunner,
  ): Promise<T | null>;

  delete(
    where: FindOptionsWhere<T>,
    queryRunner?: QueryRunner,
  ): Promise<number>;

  softDelete(
    where: FindOptionsWhere<T>,
    queryRunner?: QueryRunner,
  ): Promise<number>;

  count(where?: FindOptionsWhere<T>): Promise<number>;
}
