import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from 'src/database/entities';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';

@Injectable()
export class WalletRepository extends BaseRepository<Wallet> {
  protected readonly logger = new Logger(WalletRepository.name);

  constructor(
    @InjectRepository(Wallet)
    readonly walletRepository: Repository<Wallet>,
  ) {
    super(walletRepository);
  }
}
