import { Module } from '@nestjs/common';
import { LedgerService } from './services/ledger/ledger.service';
import { DatabaseModule } from 'src/database/database.module';
import { LedgerRepository } from 'src/database/repositories/ledger.repository';

@Module({
  imports: [DatabaseModule.forFeature()],
  providers: [LedgerService, LedgerRepository],
  exports: [LedgerService],
})
export class LedgerModule {}
