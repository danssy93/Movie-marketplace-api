import { Module } from '@nestjs/common';
import { AdminMovieController } from './controllers/adminMovie/adminMovie.controller';
import { MovieService } from './services/movie/movie.service';
import { MovieRepository } from 'src/database/repositories/movie.repository';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';
import { UserMovieController } from './controllers/userMovie/userMovie.controller';
import { MovieTransactionController } from './controllers/movie-transaction/movie-transaction.controller';
import { MovieTransactionService } from './services/movie-transaction/movie-transaction.service';

@Module({
  imports: [DatabaseModule.forFeature(), UserModule],
  controllers: [
    AdminMovieController,
    UserMovieController,
    MovieTransactionController,
  ],
  providers: [MovieService, MovieRepository, MovieTransactionService],
})
export class MovieModule {}
