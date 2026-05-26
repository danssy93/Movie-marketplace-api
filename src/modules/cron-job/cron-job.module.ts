import { Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { RefundFailedTransactionsService } from './refund-failed-transactions/refund.service';
import { DatabaseModule } from 'src/database/database.module';
import { WalletModule } from '../wallet/wallet.module';
import { MovieTransactionRepository } from 'src/database/repositories/movie-transaction';
import { RequeryTransactionService } from './requery-transactions/requery.service';

@Module({
  imports: [DatabaseModule.forFeature(), WalletModule],
  providers: [
    CronJobService,
    RefundFailedTransactionsService,
    RequeryTransactionService,
    MovieTransactionRepository,
  ],
})
export class CronJobModule {}
