import { Module } from '@nestjs/common';
import { AdminMovieController } from './controllers/adminMovie/adminMovie.controller';
import { MovieService } from './services/movie/movie.service';
import { MovieRepository } from 'src/database/repositories/movie.repository';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';
import { UserMovieController } from './controllers/userMovie/userMovie.controller';
import { WalletModule } from '../wallet/wallet.module';
import { MovieTransactionManagementService } from './services/movie-transaction/movie-transaction-management.service';
import { MovieTransactionRepository } from 'src/database/repositories/movie-transaction';

@Module({
  imports: [DatabaseModule.forFeature(), UserModule, WalletModule],
  controllers: [AdminMovieController, UserMovieController],
  providers: [
    MovieService,
    MovieRepository,
    MovieTransactionManagementService,
    MovieTransactionRepository,
  ],
  exports: [MovieTransactionRepository],
})
export class MovieModule {}
