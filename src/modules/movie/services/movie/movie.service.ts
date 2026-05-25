import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MovieRepository } from 'src/database/repositories/movie.repository';
import { CreateMovieDto } from '../../dtos/createMovie.dto';
import { Admin, User } from 'src/database/entities';
import {
  IBuyMovieResponse,
  IMovieResponse,
} from '../../interfaces/movie.inteface';
import { MovieStatus } from 'src/database/entities/movie.entity';
import AppError from 'src/common/error/AppError';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { MovieTransactionManagementService } from '../movie-transaction/movie-transaction-management.service';
import { PurchaseMovieDto } from '../../dtos/purchase.dto';
import {
  TransactionStatus,
  TransactionType,
  WalletType,
} from 'src/modules/wallet/enum/wallet.enum';
import { DataSource } from 'typeorm/data-source/DataSource.js';
import { Helpers } from 'src/common/utils';

@Injectable()
export class MovieService {
  protected readonly logger = new Logger(MovieService.name);

  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly movieTransactionService: MovieTransactionManagementService,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

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

  async purchaseMovie(
    payload: PurchaseMovieDto,
    user: User,
  ): Promise<IBuyMovieResponse> {
    const { id: userId } = user;

    // 1. Find the movie
    const movie = await this.movieRepository.findOne({
      id: String(payload.movie_id),
    });

    if (!movie) {
      throw new AppError('Movie not found', HttpStatus.NOT_FOUND);
    }

    // 2. Check if movie is published
    if (movie.status !== MovieStatus.PUBLISHED) {
      throw new AppError(
        'Movie is not available for purchase',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. Check if customer already bought this movie
    const existingPurchase = await this.movieTransactionService.findOne({
      customer: { id: userId },
      movie: { id: payload.movie_id },
      status: TransactionStatus.SUCCESSFUL,
    });

    if (existingPurchase) {
      throw new AppError(
        'You have already purchased this movie',
        HttpStatus.CONFLICT,
      );
    }

    // 4. Find customer wallet
    const customerWallet = await this.walletService.findOne(
      { user_id: userId },
      true,
    );

    if (!customerWallet) {
      throw new AppError('Customer wallet not found', HttpStatus.NOT_FOUND);
    }

    // 5. Check if customer has enough balance
    if (Number(customerWallet.balance) < Number(movie.price)) {
      throw new AppError('Insufficient wallet balance', HttpStatus.BAD_REQUEST);
    }

    // 6. Calculate split
    const amount = Number(movie.price);
    const isAuthorMovie = !!movie.author; // true if uploaded by author
    const authorShare = isAuthorMovie
      ? Number((amount * 0.7).toFixed(2)) // 70% to author
      : 0; // 0% if admin uploaded
    const platformShare = isAuthorMovie
      ? Number((amount * 0.3).toFixed(2)) // 30% to platform
      : amount; // 100% to platform if admin uploaded

    // 7. Generate transaction ID
    const transactionId = Helpers.generateReference();

    // 8. Start queryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 9. Debit customer wallet
      await this.walletService.debitWallet(
        { user_id: userId },
        {
          amount,
          user_id: userId,
          transaction_id: transactionId,
          transaction_type: TransactionType.DEBIT,
        },
      );

      // 10. Credit author wallet (only if author uploaded)
      if (isAuthorMovie && movie.author) {
        await this.walletService.creditWallet(
          { user_id: movie.author.id },
          {
            amount: authorShare,
            user_id: movie.author.id,
            transaction_id: transactionId,
            transaction_type: TransactionType.CREDIT,
          },
        );
      }

      // 11. Credit platform wallet
      const platformWallet = await this.walletService.findOne(
        { type: WalletType.PLATFORM },
        true,
      );

      if (!platformWallet) {
        throw new AppError('Platform wallet not found', HttpStatus.NOT_FOUND);
      }

      await this.walletService.creditWallet(
        { id: platformWallet.id },
        {
          amount: platformShare,
          user_id: platformWallet.user_id ?? '',
          transaction_id: transactionId,
          transaction_type: TransactionType.CREDIT,
        },
      );

      // 12. Create movie transaction record
      const movieTransaction = await this.movieTransactionService.create({
        customer: user,
        movie,
        amount,
        author_share: authorShare,
        platform_share: platformShare,
        transaction_id: transactionId,
        status: TransactionStatus.SUCCESSFUL,
        paid: true,
        payment_reference: Helpers.generateReference(),
        customer_name: user.full_name,
        transaction_type: TransactionType.DEBIT,
        movie_genre: movie.genre,
      });

      // 13. Commit transaction
      await queryRunner.commitTransaction();

      // 14. Return receipt
      return {
        message: 'Movie purchased successfully',
        status: TransactionStatus.SUCCESSFUL,
        payload: {
          amount,
          movie_id: String(movie.id),
          created_at: new Date().toISOString(),
          transaction_id: transactionId,
          status: TransactionStatus.SUCCESSFUL,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error purchasing movie: ${error.message}`,
        error.stack,
      );
      throw new AppError(
        'An error occurred while processing your purchase',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
