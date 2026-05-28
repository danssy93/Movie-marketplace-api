import { Injectable, Logger } from '@nestjs/common';
import { Helpers } from 'src/common/utils';
import { MovieTransaction } from 'src/database/entities/movie-transaction.entity';
import { MovieTransactionRepository } from 'src/database/repositories/movie-transaction';
import {
  TransactionStatus,
  TransactionType,
} from 'src/modules/wallet/enum/wallet.enum';
import { WalletService } from 'src/modules/wallet/wallet.service';

@Injectable()
export class RefundFailedTransactionsService {
  private readonly logger = new Logger(RefundFailedTransactionsService.name);
  private readonly BATCH_SIZE = 20; // Number of transactions to process in each batch

  constructor(
    private readonly walletService: WalletService,
    private readonly movieTransactionRepository: MovieTransactionRepository,
  ) {}

  async refundFailedTransactions() {
    this.logger.log('Starting refund process for failed transactions');

    let batch = 0;
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    while (true) {
      const failedTransactions = await this.movieTransactionRepository.find({
        where: { status: TransactionStatus.FAILED, is_resolved: false },
        skip: batch * this.BATCH_SIZE,
        take: this.BATCH_SIZE,
      });

      if (failedTransactions.length === 0) {
        break;
      }

      this.logger.log(
        `Processing batch ${batch + 1}: ${failedTransactions.length} failed transactions`,
      );

      for (const transaction of failedTransactions) {
        try {
          const refundExists = await this.movieTransactionRepository.findOne({
            transaction_id: transaction.transaction_id,
            transaction_type: TransactionType.CREDIT,
          });

          if (refundExists) {
            this.logger.log(
              `Transaction ${transaction.transaction_id} already refunded`,
            );

            await this.markTransactionResolved(transaction);

            continue;
          }
          await this.processRefund(transaction);
          await this.markTransactionResolved(transaction);

          await new Promise((resolve) => setTimeout(resolve, 2000));

          totalSuccess++;
        } catch (error) {
          totalFailed++;
          this.logger.error(
            `Error refunding transaction ${transaction.transaction_id}: ${error.message}`,
            error.stack,
          );
        } finally {
          totalProcessed++;
        }
      }
      batch++;
    }
    this.logger.log(
      `Refund process completed. Total: ${totalProcessed}, Success: ${totalSuccess}, Failed: ${totalFailed}`,
    );
  }

  private async processRefund(transaction: MovieTransaction) {
    await this.walletService.creditWallet(
      { user: { id: transaction.customer.id } },
      {
        user_id: String(transaction.customer.id),
        amount: transaction.amount,
        transaction_type: TransactionType.CREDIT,
        transaction_id: transaction.transaction_id,
      },
    );
  }

  private async markTransactionResolved(transaction: MovieTransaction) {
    await this.movieTransactionRepository.update(
      { id: transaction.id },
      {
        status: TransactionStatus.REFUNDED,
        is_resolved: true,
        updated_at: new Date(),
      },
    );
  }
}
