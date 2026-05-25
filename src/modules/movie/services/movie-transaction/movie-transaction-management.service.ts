import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import AppError from 'src/common/error/AppError';
import { GenericObjectType } from 'src/common/interfaces';
import { MovieTransaction } from 'src/database/entities/movie-transaction.entity';
import { MovieTransactionRepository } from 'src/database/repositories/movie-transaction';
import { BasePaginationDto } from '../../dtos/pagination.dto';
import {
  ApiFeatures,
  PaginatedResponse,
} from 'src/database/utils/pagination.service';

@Injectable()
export class MovieTransactionManagementService {
  private readonly logger = new Logger(MovieTransactionManagementService.name);

  constructor(
    private readonly movieTransactionRepository: MovieTransactionRepository,
  ) {}

  async create(
    payload: Partial<MovieTransaction>,
  ): Promise<Partial<MovieTransaction>> {
    const record = await this.movieTransactionRepository.create(
      payload as MovieTransaction,
    );

    return record.toPayload();
  }

  async update(
    queryObject: GenericObjectType,
    payload: Partial<MovieTransaction>,
  ) {
    const transaction = await this.findOne(queryObject, true);

    if (!transaction) {
      throw new AppError(
        'An error occured processing your request, try again',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.movieTransactionRepository.update(queryObject, payload);
  }

  async findOne(
    queryObject: GenericObjectType,
    throwError = false,
  ): Promise<Partial<MovieTransaction> | null> {
    const record = await this.movieTransactionRepository.findOne(queryObject);

    if (!record && throwError) {
      throw new AppError('Record not found', HttpStatus.NOT_FOUND);
    }

    return record ? record.toPayload() : null;
  }

  async find(
    paginationDto: BasePaginationDto,
    userId?: string,
  ): Promise<PaginatedResponse<MovieTransaction>> {
    const query: GenericObjectType = { ...paginationDto };

    if (userId) {
      query['user_id'] = userId;
    }

    return new ApiFeatures<MovieTransaction>(
      this.movieTransactionRepository.movieTransactionRepository,
      query,
    )
      .filter()
      .sort()
      .select([
        'id',
        'amount',
        'date_completed',
        'status',
        'user_id',
        'transaction_date',
        'balance_before',
        'balance_after',
        'type',
      ])
      .paginate()
      .getResults();
  }
}
