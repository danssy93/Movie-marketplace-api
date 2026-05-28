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
    if (queryRunner) {
      const ledger = queryRunner.manager.create(Ledger, payload);
      return await queryRunner.manager.save(ledger);
    }
    return await this.ledgerRepository.create(payload);
  }

  async findOne(query: FindOptionsWhere<Ledger>): Promise<Ledger | null> {
    return await this.ledgerRepository.findOne(query);
  }
}
