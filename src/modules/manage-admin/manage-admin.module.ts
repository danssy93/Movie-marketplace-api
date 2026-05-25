import { Module } from '@nestjs/common';
import { ManageAdminService } from './service';
import { ManageAdminController } from './controller';
import { DatabaseModule } from 'src/database/database.module';
import { CmsAdminRepository } from 'src/database/repositories';
import { ApiFeaturesFactory } from 'src/database/utils/pagination.factory';

@Module({
  imports: [DatabaseModule.forFeature()],
  providers: [ManageAdminService, CmsAdminRepository, ApiFeaturesFactory],
  controllers: [ManageAdminController],
  exports: [ManageAdminService],
})
export class ManageAdminModule {}
