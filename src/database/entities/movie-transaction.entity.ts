import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from './base.entity';
import { Ledger } from './ledger.entity';
import { User } from './user.entity';
import {
  TransactionStatus,
  TransactionType,
} from 'src/modules/wallet/enum/wallet.enum';
import { Movie, MovieGenre } from './movie.entity';

@Entity()
export class MovieTransaction extends AbstractEntity {
  @Column({ default: false })
  is_resolved: boolean;

  @Column({ default: 0 })
  requery_count: number;

  @Column({ type: 'enum', enum: TransactionType })
  transaction_type: TransactionType;

  @Column({ type: 'enum', enum: MovieGenre, nullable: true })
  movie_genre: MovieGenre;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  author_share: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  platform_share: number;

  @Column({ default: false })
  paid: boolean;

  @Column({ nullable: true })
  payment_reference: string;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  customer_name: string;

  @OneToOne(() => Ledger, (ledger) => ledger.movie_transaction)
  @JoinColumn()
  ledger: Ledger;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => Movie, { eager: true })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  toPayload(): Partial<MovieTransaction> {
    return {
      id: this.id,
      customer: this.customer,
      movie: this.movie,
      movie_genre: this.movie_genre,
      amount: this.amount,
      author_share: this.author_share,
      platform_share: this.platform_share,
      payment_reference: this.payment_reference,
      transaction_id: this.transaction_id,
      status: this.status,
      created_at: this.created_at,
      customer_name: this.customer_name,
    };
  }
}
