import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MovieRepository } from 'src/database/repositories/movie.repository';
import { CreateMovieDto } from '../../dtos/createMovie.dto';
import { Admin, User } from 'src/database/entities';
import { IMovieResponse } from '../../interfaces/movie.inteface';
import { MovieStatus } from 'src/database/entities/movie.entity';
import AppError from 'src/common/error/AppError';

@Injectable()
export class MovieService {
  protected readonly logger = new Logger(MovieService.name);

  constructor(private readonly movieRepository: MovieRepository) {}

  async createMovie(
    payload: CreateMovieDto,
    uploader: User | Admin,
  ): Promise<IMovieResponse> {
    const isAuthor = uploader instanceof User;

    const existingMovie = await this.movieRepository.findOne({
      title: payload.title,
    });

    if (existingMovie) {
      throw new AppError('Movie with this title already exists', 400);
    }

    const movie = await this.movieRepository.create({
      ...payload,
      status: MovieStatus.DRAFT,
      author: isAuthor ? (uploader as User) : undefined,
      admin: !isAuthor ? (uploader as Admin) : undefined,
    });

    return this.formatResponse(movie);
  }

  async updateMovie(
    movieId: string,
    status: MovieStatus,
    admin: Admin,
  ): Promise<IMovieResponse> {
    const movie = await this.movieRepository.findOne({ id: movieId });

    if (!movie) {
      throw new AppError('Movie not found', HttpStatus.NOT_FOUND);
    }

    const updated = await this.movieRepository.update(
      { id: movieId },
      { status },
    );
    return this.formatResponse(updated);
  }

  async getMovies(): Promise<IMovieResponse[]> {
    const movies = await this.movieRepository.find();
    return movies.map((movie) => this.formatResponse(movie));
  }

  private formatResponse(movie: any): IMovieResponse {
    return {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      price: movie.price,
      genre: movie.genre,
      status: movie.status,
      thumbnail_url: movie.thumbnail_url,
      video_url: movie.video_url,
      duration: movie.duration,
      author: movie.author ? movie.author.full_name : movie.admin?.full_name,
      release_date: movie.release_date,
      created_at: movie.created_at,
    };
  }
}
