import { Entity, JoinColumn, OneToOne, Column, OneToMany } from 'typeorm';
import { AbstractEntity } from './base.entity';
import { User } from './user.entity';
import { Ledger } from './ledger.entity';
import { WalletType } from 'src/modules/wallet/enum/wallet.enum';

@Entity('wallet')
export class Wallet extends AbstractEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @Column({ type: 'enum', enum: WalletType, default: WalletType.CUSTOMER })
  type: WalletType;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  user: User;

  @OneToMany(() => Ledger, (ledger) => ledger.wallet)
  ledgers: Ledger;

  toPayload(): Partial<Wallet> {
    return {
      id: this.id,
      balance: this.balance,
      created_at: this.created_at,
    };
  }
}
