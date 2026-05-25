import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Movie } from '../entities/movie.entity';

@Injectable()
export class MovieRepository extends BaseRepository<Movie> {
  protected readonly logger = new Logger(MovieRepository.name);

  constructor(
    @InjectRepository(Movie)
    readonly movieRepository: Repository<Movie>,
  ) {
    super(movieRepository);
  }
}
