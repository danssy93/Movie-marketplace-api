import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserRepository } from 'src/database/repositories';
import { DatabaseModule } from 'src/database/database.module';
import { UserService } from './services/user.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [DatabaseModule.forFeature(), WalletModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
