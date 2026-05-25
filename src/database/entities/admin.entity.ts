import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { AbstractEntity } from './base.entity';
import { AdministratorType, Role } from '../enums/user.enum';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

@Entity('admin')
export class Admin extends AbstractEntity {
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
  roles: AdministratorType[];

  @Column({ default: true })
  is_active: boolean;

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

  toPayload(): Partial<Admin> {
    return {
      id: this.id,
      email: this.email,
      phone: this.phone,
      roles: this.roles,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
