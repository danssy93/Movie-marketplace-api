import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BasePaginationWithDateDto } from 'src/modules/movie/dtos/pagination.dto';
import { DataSource } from 'typeorm';
import {
  IAdminDashboard,
  IAuthorDashboard,
  ICustomerDashboard,
} from '../interfaces/dashboard.interface';
import { MovieStatus } from 'src/database/entities';
import {
  TransactionStatus,
  WalletType,
} from 'src/modules/wallet/enum/wallet.enum';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private getDateRange(filter: BasePaginationWithDateDto): {
    start: Date;
    end: Date;
  } {
    const end = filter.end_date ? new Date(filter.end_date) : new Date();
    const start = filter.start_date
      ? new Date(filter.start_date)
      : new Date('2000-01-01');
    return { start, end };
  }

  async getAdminDashboard(
    filter: BasePaginationWithDateDto,
  ): Promise<IAdminDashboard> {
    const { start, end } = this.getDateRange(filter);

    const totalUsers = await this.dataSource
      .getRepository('users')
      .createQueryBuilder('user')
      .getCount();

    const totalCustomers = await this.dataSource
      .getRepository('users')
      .createQueryBuilder('user')
      .where('user.roles LIKE :role', { role: '%customer%' })
      .getCount();

    const totalAuthors = await this.dataSource
      .getRepository('users')
      .createQueryBuilder('user')
      .where('user.roles LIKE :role', { role: '%author%' })
      .getCount();

    const newUsersPeriod = await this.dataSource
      .getRepository('users')
      .createQueryBuilder('user')
      .where('user.created_at BETWEEN :start AND :end', { start, end })
      .getCount();

    const totalMovies = await this.dataSource
      .getRepository('movies')
      .createQueryBuilder('movie')
      .getCount();

    const publishedMovies = await this.dataSource
      .getRepository('movies')
      .createQueryBuilder('movie')
      .where('movie.status = :status', { status: MovieStatus.PUBLISHED })
      .getCount();

    const draftMovies = await this.dataSource
      .getRepository('movies')
      .createQueryBuilder('movie')
      .where('movie.status = :status', { status: MovieStatus.DRAFT })
      .getCount();

    const topSelling = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .select('mt.movie_id', 'movie_id')
      .addSelect('COUNT(mt.id)', 'total_purchases')
      .addSelect('SUM(mt.amount)', 'total_revenue')
      .addSelect('m.title', 'title')
      .innerJoin('movies', 'm', 'm.id = mt.movie_id')
      .where('mt.status = :status', { status: TransactionStatus.SUCCESSFUL })
      .andWhere('mt.created_at BETWEEN :start AND :end', { start, end })
      .groupBy('mt.movie_id')
      .addGroupBy('m.title')
      .orderBy('total_Purchases', 'DESC')
      .limit(5)
      .getRawMany();

    // 4. Revenue stats
    const platformWallet = await this.dataSource
      .getRepository('wallet')
      .createQueryBuilder('wallet')
      .where('wallet.type = :type', { type: WalletType.PLATFORM })
      .getOne();

    const totalRevenue = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .select('SUM(mt.platform_share)', 'total')
      .where('mt.status = :status', { status: TransactionStatus.SUCCESSFUL })
      .getRawOne();

    const periodRevenue = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .select('SUM(mt.platform_share)', 'total')
      .where('mt.status = :status', { status: TransactionStatus.SUCCESSFUL })
      .andWhere('mt.created_at BETWEEN :start AND :end', { start, end })
      .getRawOne();

    // 5. Transaction stats
    const totalTransactions = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .getCount();

    const successfulTransactions = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .where('mt.status = :status', { status: TransactionStatus.SUCCESSFUL })
      .getCount();

    const failedTransactions = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .where('mt.status = :status', { status: TransactionStatus.FAILED })
      .getCount();

    const refundedTransactions = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .where('mt.status = :status', { status: TransactionStatus.REFUNDED })
      .getCount();

    // 6. Recent transactions
    const recentTransactions = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .leftJoin('movies', 'm', 'm.id = mt.movie_id')
      .select([
        'mt.id as id',
        'mt.amount as amount',
        'mt.status as status',
        'mt.created_at as created_at',
        'mt.customer_name as customer_name',
        'm.title as movie_title',
      ])
      .orderBy('mt.created_at', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      users: {
        total: totalUsers,
        total_customers: totalCustomers,
        total_authors: totalAuthors,
        new_this_period: newUsersPeriod,
      },
      movies: {
        total: totalMovies,
        published: publishedMovies,
        draft: draftMovies,
        top_selling: topSelling.map((m) => ({
          id: m.movie_id,
          title: m.title,
          total_purchases: Number(m.total_purchases),
          total_revenue: Number(m.total_revenue),
        })),
      },
      revenue: {
        platform_balance: Number(platformWallet?.['balance'] ?? 0),
        total_revenue: Number(totalRevenue?.total ?? 0),
        revenue_this_period: Number(periodRevenue?.total ?? 0),
      },
      transactions: {
        total: totalTransactions,
        successful: successfulTransactions,
        failed: failedTransactions,
        refunded: refundedTransactions,
        recent: recentTransactions.map((t) => ({
          id: t.id,
          customer_name: t.customer_name,
          movie_title: t.movie_title,
          amount: Number(t.amount),
          status: t.status,
          created_at: t.created_at,
        })),
      },
    };
  }
  async getAuthorDashboard(
    authorId: number,
    filter: BasePaginationWithDateDto,
  ): Promise<IAuthorDashboard> {
    const { start, end } = this.getDateRange(filter);
    // 1. Author movies
    const totalMovies = await this.dataSource
      .getRepository('movies')
      .createQueryBuilder('movie')
      .where('movie.author_id = :authorId', { authorId })
      .getCount();

    const publishedMovies = await this.dataSource
      .getRepository('movies')
      .createQueryBuilder('movie')
      .where('movie.author_id = :authorId', { authorId })
      .andWhere('movie.status = :status', { status: MovieStatus.PUBLISHED })
      .getCount();

    const draftMovies = await this.dataSource
      .getRepository('movies')
      .createQueryBuilder('movie')
      .where('movie.author_id = :authorId', { authorId })
      .andWhere('movie.status = :status', { status: MovieStatus.DRAFT })
      .getCount();

    // 2. Movies with purchase stats
    const moviesList = await this.dataSource
      .getRepository('movies')
      .createQueryBuilder('movie')
      .leftJoin(
        'movie_transaction',
        'mt',
        'mt.movie_id = movie.id AND mt.status = :status',
        { status: TransactionStatus.SUCCESSFUL },
      )
      .select([
        'movie.id as id',
        'movie.title as title',
        'movie.status as status',
        'movie.price as price',
        'COUNT(mt.id) as total_purchases',
        'SUM(mt.author_share) as total_revenue',
      ])
      .where('movie.author_id = :authorId', { authorId })
      .groupBy('movie.id')
      .getRawMany();

    // 3. Author wallet
    const authorWallet = await this.dataSource
      .getRepository('wallet')
      .createQueryBuilder('wallet')
      .where('wallet.userId = :authorId', { authorId })
      .andWhere('wallet.type = :type', { type: WalletType.AUTHOR })
      .getOne();

    // 4. Total earned
    const totalEarned = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .select('SUM(mt.author_share)', 'total')
      .innerJoin('movies', 'm', 'm.id = mt.movie_id')
      .where('m.author_id = :authorId', { authorId })
      .andWhere('mt.status = :status', { status: TransactionStatus.SUCCESSFUL })
      .getRawOne();

    // 5. Earned this period
    const periodEarned = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .select('SUM(mt.author_share)', 'total')
      .innerJoin('movies', 'm', 'm.id = mt.movie_id')
      .where('m.author_id = :authorId', { authorId })
      .andWhere('mt.status = :status', { status: TransactionStatus.SUCCESSFUL })
      .andWhere('mt.created_at BETWEEN :start AND :end', { start, end })
      .getRawOne();

    // 6. Recent transactions
    const recentTransactions = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .leftJoin('movies', 'm', 'm.id = mt.movie_id')
      .select([
        'mt.id as id',
        'mt.amount as amount',
        'mt.status as status',
        'mt.created_at as created_at',
        'mt.customer_name as customer_name',
        'm.title as movie_title',
      ])
      .where('m.author_id = :authorId', { authorId })
      .orderBy('mt.created_at', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      movies: {
        total: totalMovies,
        published: publishedMovies,
        draft: draftMovies,
        list: moviesList.map((m) => ({
          id: m.id,
          title: m.title,
          status: m.status,
          price: Number(m.price),
          total_purchases: Number(m.total_purchases ?? 0),
          total_revenue: Number(m.total_revenue ?? 0),
        })),
      },
      earnings: {
        wallet_balance: Number(authorWallet?.['balance'] ?? 0),
        total_earned: Number(totalEarned?.total ?? 0),
        earned_this_period: Number(periodEarned?.total ?? 0),
      },
      transactions: {
        total: recentTransactions.length,
        recent: recentTransactions.map((t) => ({
          id: t.id,
          customer_name: t.customer_name,
          movie_title: t.movie_title,
          amount: Number(t.amount),
          status: t.status,
          created_at: t.created_at,
        })),
      },
    };
  }

  // ===========================
  // CUSTOMER DASHBOARD
  // ===========================
  async getCustomerDashboard(
    customerId: number,
    filter: BasePaginationWithDateDto,
  ): Promise<ICustomerDashboard> {
    const { start, end } = this.getDateRange(filter);

    // 1. Customer wallet
    const customerWallet = await this.dataSource
      .getRepository('wallet')
      .createQueryBuilder('wallet')
      .where('wallet.userId = :customerId', { customerId })
      .andWhere('wallet.type = :type', { type: WalletType.CUSTOMER })
      .getOne();

    // 2. Purchased movies
    const totalPurchases = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .where('mt.customer_id = :customerId', { customerId })
      .andWhere('mt.status = :status', { status: TransactionStatus.SUCCESSFUL })
      .getCount();

    const recentPurchases = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .leftJoin('movies', 'm', 'm.id = mt.movie_id')
      .select([
        'm.id as id',
        'm.title as title',
        'm.genre as genre',
        'm.price as price',
        'mt.created_at as purchased_at',
      ])
      .where('mt.customer_id = :customerId', { customerId })
      .andWhere('mt.status = :status', { status: TransactionStatus.SUCCESSFUL })
      .orderBy('mt.created_at', 'DESC')
      .limit(10)
      .getRawMany();

    // 3. Recent transactions
    const recentTransactions = await this.dataSource
      .getRepository('movie_transaction')
      .createQueryBuilder('mt')
      .leftJoin('movies', 'm', 'm.id = mt.movie_id')
      .select([
        'mt.id as id',
        'mt.amount as amount',
        'mt.status as status',
        'mt.created_at as created_at',
        'mt.customer_name as customer_name',
        'm.title as movie_title',
      ])
      .where('mt.customer_id = :customerId', { customerId })
      .andWhere('mt.created_at BETWEEN :start AND :end', { start, end })
      .orderBy('mt.created_at', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      wallet: {
        balance: Number(customerWallet?.['balance'] ?? 0),
      },
      purchases: {
        total: totalPurchases,
        recent: recentPurchases.map((p) => ({
          id: p.id,
          title: p.title,
          genre: p.genre,
          price: Number(p.price),
          purchased_at: p.purchased_at,
        })),
      },
      transactions: {
        total: recentTransactions.length,
        recent: recentTransactions.map((t) => ({
          id: t.id,
          customer_name: t.customer_name,
          movie_title: t.movie_title,
          amount: Number(t.amount),
          status: t.status,
          created_at: t.created_at,
        })),
      },
    };
  }
}
