import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ManageAdminModule } from './modules/manage-admin/manage-admin.module';
import { UserModule } from './modules/user/user.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { UserAuthModule } from './modules/user-auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { MovieModule } from './modules/movie/movie.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { CronJobModule } from './modules/cron-job/cron-job.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    AdminAuthModule,
    ManageAdminModule,
    UserModule,
    UserAuthModule,
    WalletModule,
    MovieModule,
    LedgerModule,
    CronJobModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
