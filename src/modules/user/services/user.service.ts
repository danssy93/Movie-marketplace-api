import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import AppError from 'src/common/error/AppError';
import { GenericObjectType } from 'src/common/interfaces';
import { User } from 'src/database/entities';
import { Role } from 'src/database/enums/user.enum';
import { UserRepository } from 'src/database/repositories';
import { WalletType } from 'src/modules/wallet/enum/wallet.enum';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { DataSource, FindOptionsWhere, QueryRunner } from 'typeorm';

@Injectable()
export class UserService {
  protected readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletService: WalletService,
    private readonly datasource: DataSource,
  ) {}

  async create(user: Partial<User>): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne({
      email: user.email,
    });

    if (existingUser) {
      throw new AppError('User already exists', HttpStatus.CONFLICT);
    }

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const createUser = await this.userRepository.create(user, queryRunner);

      if (user.roles && user.roles.includes(Role.CUSTOMER)) {
        await this.walletService.create(
          {
            user: createUser,
            type: WalletType.CUSTOMER,
          },
          queryRunner,
        );
      }

      if (user.roles && user.roles.includes(Role.AUTHOR)) {
        await this.walletService.create(
          {
            user: createUser,
            type: WalletType.AUTHOR,
          },
          queryRunner,
        );
      }

      await queryRunner?.commitTransaction();
      return createUser.toPayload();
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();

      throw new AppError(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findOneBy(query: GenericObjectType): Promise<User | null> {
    return this.userRepository.findOne(query);
  }

  async findOne(
    query: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    throwError = true,
    options?: any,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne(query, options);

    if (throwError && !existingUser) {
      throw new AppError('User record not found', HttpStatus.NOT_FOUND);
    }

    return existingUser as User;
  }

  async find(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(
    queryObject: GenericObjectType,
    data: Partial<User>,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    const updatedUser = await this.userRepository.update(
      queryObject,
      data,
      queryRunner,
    );

    if (!updatedUser) {
      throw new AppError(
        'User not found or update failed',
        HttpStatus.NOT_FOUND,
      );
    }

    return updatedUser;
  }

  async save(data: Partial<User>): Promise<User> {
    return this.userRepository.save(data);
  }
}
