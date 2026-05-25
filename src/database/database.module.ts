import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Admin, Wallet, Ledger } from './entities';
import { dataSourceOptions } from './datasources';
import { Movie } from './entities/movie.entity';
import { MovieTransaction } from './entities/movie-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const logger = new Logger('DatabaseModule');
        try {
          logger.log('Initializing database connection...');
          return dataSourceOptions;
        } catch (error) {
          logger.error('Database connection failed', error.stack);
          throw error;
        }
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  static forFeature() {
    return TypeOrmModule.forFeature([
      User,
      Admin,
      Wallet,
      Movie,
      Ledger,
      MovieTransaction,
    ]);
  }
}
