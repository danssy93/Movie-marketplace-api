import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RequeryTransactionService } from './requery-transactions/requery.service';
import { RefundFailedTransactionsService } from './refund-failed-transactions/refund.service';

@Injectable()
export class CronJobService {
  constructor(
    private readonly failedService: RefundFailedTransactionsService,
    private readonly requeryService: RequeryTransactionService,
  ) {}

  private readonly logger = new Logger(CronJobService.name);

  /**
   * Scheduled job that runs at midnight to calculate daily interest
   */
  @Cron('*/2 * * * *') // Runs every 2 minutes
  async handleFailedTransaction(): Promise<void> {
    try {
      this.logger.log('Refunding failed transaction calculation job');

      await this.failedService.refundFailedTransactions();

      this.logger.log('Refund job completed successfully ✅');
    } catch (error) {
      this.logger.error(
        `Error in daily interest calculation: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Scheduled job that runs at midnight to calculate daily interest
   */
  // @Cron(CronExpression.EVERY_10_SECONDS)
  @Cron('*/2 * * * *') // Runs every 2 minutes
  async handleRequeryTransaction(): Promise<void> {
    try {
      this.logger.log('Starting daily interest calculation job');

      await this.requeryService.processRequeryTransactions();

      this.logger.log('Requery job completed successfully ✅');
    } catch (error) {
      this.logger.error(
        `Error in daily interest calculation: ${error.message}`,
        error.stack,
      );
    }
  }
}
