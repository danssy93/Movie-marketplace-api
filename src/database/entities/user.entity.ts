import { BeforeInsert, BeforeUpdate, Column, Entity, OneToOne } from 'typeorm';
import { AbstractEntity } from './base.entity';
import { Role } from '../enums/user.enum';
import * as bcrypt from 'bcrypt';
import { Wallet } from './wallet.entity';
import { Ledger } from './ledger.entity';

export interface ICurrentUserDetails {
  id: string;
  phone: string;
  email: string;
  created_at: Date;
  full_name?: string;
  refresh_token: string;
  is_active: boolean;
  roles: Role[];
}

@Entity('users')
export class User extends AbstractEntity {
  @Column()
  full_name: string;

  @Column({ length: 20, type: 'varchar' })
  phone: string;

  @Column({ length: 255, type: 'varchar', nullable: true })
  email: string;

  @Column({ length: 255, type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'text', nullable: true })
  refresh_token?: string | null;

  @Column({
    type: 'simple-array',
  })
  roles: Role[];

  @Column({ default: true })
  is_active: boolean;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToOne(() => Ledger, (ledger) => ledger.user)
  ledgers: Ledger[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.phone) {
      this.phone = this.phone.replace('+', '');
    }
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  toPayload(): Partial<User> {
    return {
      id: this.id,
      email: this.email,
      phone: this.phone,
      roles: this.roles,
      is_active: this.is_active,
      created_at: this.created_at,
      wallet: this.wallet,
    };
  }
}
