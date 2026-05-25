import { Injectable, Scope } from '@nestjs/common';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import type { GenericObjectType } from 'src/common/interfaces';

export interface PaginationInfo {
  current_page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedResponse<T> {
  records: T[];
  pagination_info: PaginationInfo;
}

@Injectable({ scope: Scope.TRANSIENT })
export class ApiFeatures<T extends ObjectLiteral> {
  private readonly repository: Repository<T>;
  private readonly queryString: GenericObjectType;
  private queryBuilder: SelectQueryBuilder<T>;
  private filterObj: GenericObjectType;

  constructor(repository: Repository<T>, queryString: GenericObjectType) {
    this.repository = repository;
    this.queryString = queryString;
    this.queryBuilder = this.repository.createQueryBuilder('entity');
    this.parsePaginationDto();
  }

  parsePaginationDto(): this {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];

    excludeFields.forEach((field) => delete queryObj[field]);

    this.filterObj = queryObj;

    return this;
  }

  filter(): this {
    Object.entries(this.filterObj).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        this.queryBuilder.andWhere(`entity.${field} IN (:...${field})`, {
          [field]: value,
        });
      } else if (field !== 'start_date' && field !== 'end_date') {
        this.queryBuilder.andWhere(`entity.${field} = :${field}`, {
          [field]: value,
        });
      }
    });

    const startDate = this.filterObj.start_date
      ? `${this.filterObj.start_date} 00:00:00`
      : null;

    const endDate = this.filterObj.end_date
      ? `${this.filterObj.end_date} 23:59:59`
      : null;

    if (startDate && endDate) {
      this.queryBuilder.andWhere(
        'entity.created_at BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    return this;
  }

  sort(): this {
    const sort = this.queryString.sort;

    if (typeof sort === 'string' && sort.length > 0) {
      const sortBy = sort
        .split(',')
        .map((field) => `entity.${field}`)
        .join(', ');

      this.queryBuilder.orderBy(sortBy);
    } else {
      this.queryBuilder.orderBy('entity.created_at', 'DESC');
    }

    return this;
  }

  select(fields?: string[]): this {
    const queryFields = this.queryString.fields;

    if (fields?.length) {
      this.queryBuilder.select(fields.map((field) => `entity.${field}`));
    } else if (typeof queryFields === 'string' && queryFields.length > 0) {
      const parsedFields = queryFields
        .split(',')
        .map((field) => `entity.${field}`);

      this.queryBuilder.select(parsedFields);
    }

    return this;
  }

  paginate(): this {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.queryBuilder.skip(skip).take(limit);

    return this;
  }

  async getResults(): Promise<PaginatedResponse<T>> {
    const [records, totalItems] = await this.queryBuilder.getManyAndCount();

    const limit = Number(this.queryString.limit) || 100;
    const currentPage = Number(this.queryString.page) || 1;
    const totalPages = Math.ceil(totalItems / limit);

    const paginationInfo: PaginationInfo = {
      current_page: currentPage,
      limit,
      total_items: totalItems,
      total_pages: totalPages,
      has_next: currentPage < totalPages,
      has_previous: currentPage > 1,
    };

    return {
      records,
      pagination_info: paginationInfo,
    };
  }
}
