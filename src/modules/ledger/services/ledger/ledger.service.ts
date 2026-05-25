import { Injectable } from '@nestjs/common';
import { Ledger } from 'src/database/entities';
import { LedgerRepository } from 'src/database/repositories/ledger.repository';
import { FindOptionsWhere, QueryRunner } from 'typeorm';

@Injectable()
export class LedgerService {
  constructor(private readonly ledgerRepository: LedgerRepository) {}

  async create(
    payload: Partial<Ledger>,
    queryRunner?: QueryRunner,
  ): Promise<Ledger> {
    const ledger = await this.ledgerRepository.create(payload);
    return queryRunner
      ? await queryRunner.manager.save(ledger)
      : await this.ledgerRepository.save(ledger);
  }

  async findOne(query: FindOptionsWhere<Ledger>): Promise<Ledger | null> {
    return await this.ledgerRepository.findOne(query);
  }
}
