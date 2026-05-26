import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { AbstractEntity } from './base.entity';
import { TransactionType } from 'src/modules/wallet/enum/wallet.enum';
import { User } from './user.entity';
import { Wallet } from './wallet.entity';
import { MovieTransaction } from './movie-transaction.entity';

export enum PaymentType {
  FUNDING = 'funding',
  MOVIES_PURCHASE = 'movies_purchase',
}

@Entity()
export class Ledger extends AbstractEntity {
  @Column({ nullable: true })
  user_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  balance_before: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  balance_after: number;

  @CreateDateColumn()
  payment_date: Date;

  @Column({ length: 50, nullable: true })
  transaction_id: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'successful', 'failed', 'reversed'],
    default: 'pending',
  })
  status: 'pending' | 'successful' | 'failed' | 'reversed';

  @Index()
  @Column({ type: 'varchar', length: 30 })
  type: TransactionType;

  @OneToOne(
    () => MovieTransaction,
    (movieTransaction) => movieTransaction.ledger,
  )
  movie_transaction: MovieTransaction;

  @ManyToOne(() => User, (user) => user.ledgers)
  user: User;

  @ManyToOne(() => Wallet, (wallet) => wallet.ledgers)
  wallet: Wallet;
}
