import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Admin } from '../entities';
import { MovieTransaction } from '../entities/movie-transaction.entity';

@Injectable()
export class MovieTransactionRepository extends BaseRepository<MovieTransaction> {
  protected readonly logger = new Logger(MovieTransactionRepository.name);

  constructor(
    @InjectRepository(Admin)
    readonly movieTransactionRepository: Repository<MovieTransaction>,
  ) {
    super(movieTransactionRepository);
  }
}
