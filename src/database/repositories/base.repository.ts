import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  FindManyOptions,
  QueryRunner,
  FindOneOptions,
  ObjectLiteral,
} from 'typeorm';

import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { IBaseRepository } from '../types/base-repository.interface';

export abstract class BaseRepository<
  T extends ObjectLiteral,
> implements IBaseRepository<T> {
  constructor(protected readonly repository: Repository<T>) {}

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  async create(data: DeepPartial<T>, queryRunner?: QueryRunner): Promise<T> {
    const created = this.repository.create(data);

    if (queryRunner) {
      return await queryRunner.manager.save(created);
    }

    return await this.repository.save(created);
  }

  async createMany(
    data: DeepPartial<T>[],
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(this.repository.target)
      : this.repository;

    await repo.insert(data as any);
  }

  async findOne(
    filterQuery: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    options?: Omit<FindOneOptions<T>, 'where'>,
  ): Promise<T | null> {
    return this.repository.findOne({
      where: filterQuery,
      ...options,
    });
  }

  async find(options?: FindManyOptions<T> | FindOptionsWhere<T>): Promise<T[]> {
    if (!options) return this.repository.find();

    if (!('where' in options)) {
      return this.repository.find({
        where: options as FindOptionsWhere<T>,
      });
    }

    return this.repository.find(options as FindManyOptions<T>);
  }

  async update(
    filterQuery: FindOptionsWhere<T>,
    payload: QueryDeepPartialEntity<T>,
    queryRunner?: QueryRunner,
  ): Promise<T | null> {
    if (queryRunner) {
      await queryRunner.manager.update(
        this.repository.target,
        filterQuery,
        payload,
      );

      return queryRunner.manager.findOneBy(this.repository.target, filterQuery);
    }

    await this.repository.update(filterQuery, payload);

    return this.repository.findOneBy(filterQuery);
  }

  async save(data: DeepPartial<T>, queryRunner?: QueryRunner): Promise<T> {
    if (queryRunner) {
      const entity = this.repository.create(data);
      return await queryRunner.manager.save(entity);
    }

    return this.repository.save(data);
  }

  async delete(
    where: FindOptionsWhere<T>,
    queryRunner?: QueryRunner,
  ): Promise<number> {
    const result = queryRunner
      ? await queryRunner.manager.delete(this.repository.target, where)
      : await this.repository.delete(where);

    return result.affected ?? 0;
  }

  async softDelete(
    where: FindOptionsWhere<T>,
    queryRunner?: QueryRunner,
  ): Promise<number> {
    const result = queryRunner
      ? await queryRunner.manager.softDelete(this.repository.target, where)
      : await this.repository.softDelete(where);

    return result.affected ?? 0;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  async advancedCount(
    options?: FindManyOptions<T> | FindOptionsWhere<T>,
  ): Promise<number> {
    if (!options) return this.repository.count();

    if (!('where' in options)) {
      return this.repository.count({
        where: options as FindOptionsWhere<T>,
      });
    }

    return this.repository.count(options as FindManyOptions<T>);
  }

  async truncate(tableName: string, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      await queryRunner.query(`TRUNCATE TABLE ${tableName}`);
      return;
    }

    await this.repository.query(`TRUNCATE TABLE ${tableName}`);
  }
}
