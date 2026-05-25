import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ManageAdminModule } from './modules/manage-admin/manage-admin.module';
import { UserModule } from './modules/user/user.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { UserAuthModule } from './modules/user-auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { MovieModule } from './modules/movie/movie.module';
import { LedgerModule } from './modules/ledger/ledger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    AdminAuthModule,
    ManageAdminModule,
    UserModule,
    UserAuthModule,
    WalletModule,
    MovieModule,
    LedgerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
