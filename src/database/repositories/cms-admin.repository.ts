import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Admin } from '../entities';

@Injectable()
export class CmsAdminRepository extends BaseRepository<Admin> {
  protected readonly logger = new Logger(CmsAdminRepository.name);

  constructor(
    @InjectRepository(Admin)
    readonly cmsAdminRepository: Repository<Admin>,
  ) {
    super(cmsAdminRepository);
  }
}
