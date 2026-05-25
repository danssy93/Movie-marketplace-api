import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ledger, Wallet } from 'src/database/entities';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';

@Injectable()
export class LedgerRepository extends BaseRepository<Ledger> {
  protected readonly logger = new Logger(LedgerRepository.name);

  constructor(
    @InjectRepository(Ledger)
    readonly ledgerRepository: Repository<Ledger>,
  ) {
    super(ledgerRepository);
  }
}
