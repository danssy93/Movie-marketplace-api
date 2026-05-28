import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import AppError from 'src/common/error/AppError';
import { GenericObjectType } from 'src/common/interfaces';
import { Wallet } from 'src/database/entities';
import { WalletRepository } from 'src/database/repositories/wallet.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { LedgerService } from '../ledger/services/ledger/ledger.service';
import {
  ICreditRequestPayload,
  IDebitRequestPayload,
} from './interfaces/wallets.inteface';
import { Helpers } from 'src/common/utils';
import { TransactionStatus, TransactionType } from './enum/wallet.enum';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly ledgerService: LedgerService,
    private readonly dataSource: DataSource,
  ) {}

  async creditWallet(
    queryObject: GenericObjectType,
    payload: ICreditRequestPayload,
  ): Promise<ICreditRequestPayload> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('🔍 queryObject =', queryObject); // 👈 add this

      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: queryObject,
        lock: { mode: 'pessimistic_write' },
      });

      console.log('🔍 wallet found =', wallet);

      if (!wallet) {
        throw new AppError('Wallet not found', HttpStatus.NOT_FOUND);
      }

      console.log('🔍 updating balance...');

      await queryRunner.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({ balance: () => 'balance + :amount' })
        .where('id = :id', { id: wallet.id })
        .setParameters({ amount: payload.amount })
        .execute();

      console.log('🔍 balance updated, creating ledger...');

      const balanceAfter = Helpers.sumAmountFormatter(
        wallet.balance,
        +payload.amount,
      );

      await this.ledgerService.create(
        {
          amount: +payload.amount,
          user:
            payload.user_id && payload.user_id !== '0'
              ? ({ id: payload.user_id } as any)
              : undefined,
          wallet: wallet,
          balance_after: balanceAfter,
          type: payload.transaction_type,
          balance_before: wallet.balance,
          transaction_id: payload.transaction_id,
          status: 'successful',
        },
        queryRunner,
      );

      console.log('🔍 ledger created, committing...');

      await queryRunner.commitTransaction();

      console.log('🔍 committed!');

      return {
        amount: +payload.amount,
        user_id: payload.user_id,
        balance_after: balanceAfter,
        balance_before: wallet.balance,
        status: TransactionStatus.SUCCESSFUL,
        payment_reference: Helpers.generateReference(),
        transaction_id: payload.transaction_id,
        transaction_type: payload.transaction_type,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error crediting wallet: ${error.message}`,
        error.stack,
      );
      throw new AppError(
        'An error occurred while crediting the wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async debitWallet(
    queryObject: GenericObjectType,
    payload: IDebitRequestPayload,
  ): Promise<IDebitRequestPayload> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: queryObject,
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new AppError('Wallet not found', HttpStatus.NOT_FOUND);
      }

      if (Number(wallet.balance) < +payload.amount) {
        throw new AppError(
          'Insufficient balance for debit transaction',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updateResult = await queryRunner.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({ balance: () => 'balance - :amount' })
        .where('id = :id AND balance >= :amount', {
          id: wallet.id,
          amount: payload.amount,
        })
        .execute();

      if (updateResult.affected === 0) {
        throw new AppError(
          'Failed to debit wallet, please try again',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const balanceAfter = Helpers.subtractAmountFormatter(
        wallet.balance,
        payload.amount,
      );

      await this.ledgerService.create(
        {
          user: { id: payload.user_id } as any,
          amount: +payload.amount,
          wallet: wallet,
          balance_after: balanceAfter,
          balance_before: wallet.balance,
          type: TransactionType.DEBIT,
          transaction_id: payload.transaction_id,
          status: 'successful',
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        amount: +payload.amount,
        user_id: payload.user_id,
        balance_after: balanceAfter,
        balance_before: wallet.balance,
        status: TransactionStatus.SUCCESSFUL,
        payment_reference: Helpers.generateReference(),
        transaction_id: payload.transaction_id,
        transaction_type: payload.transaction_type,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error debiting wallet: ${error.message}`, error.stack);
      throw new AppError(
        'An error occurred while debiting the wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async create(
    payload: Partial<Wallet>,
    queryRunner?: QueryRunner,
  ): Promise<Wallet> {
    return this.walletRepository.create(payload, queryRunner);
  }

  async findOne(
    query: GenericObjectType,
    throwError = false,
  ): Promise<Partial<Wallet> | null> {
    const existingWallet = await this.walletRepository.findOne(query);

    if (throwError && !existingWallet) {
      throw new AppError('Wallet not found', HttpStatus.NOT_FOUND);
    }
    return existingWallet?.toPayload() ?? null;
  }

  async update(
    query: GenericObjectType,
    payload: Partial<Wallet>,
  ): Promise<void> {
    await this.walletRepository.update(query, payload);
  }
}
