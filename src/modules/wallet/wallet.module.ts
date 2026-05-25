import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletRepository } from 'src/database/repositories/wallet.repository';
import { DatabaseModule } from 'src/database/database.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [DatabaseModule.forFeature(), LedgerModule],
  providers: [WalletService, WalletRepository],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
