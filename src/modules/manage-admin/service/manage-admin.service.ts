import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import AppError from 'src/common/error/AppError';
import { GenericObjectType } from 'src/common/interfaces';
import { Admin } from 'src/database/entities';
import { ErrorMessages } from 'src/database/enums';
import { CmsAdminRepository } from 'src/database/repositories';
import { AdvancedBasePaginationDto } from '../dto/pagination.dto';
import { ApiFeaturesFactory } from 'src/database/utils/pagination.factory';

@Injectable()
export class ManageAdminService {
  protected readonly logger = new Logger(ManageAdminService.name);

  constructor(
    private readonly cmsAdminRepository: CmsAdminRepository,
    private readonly apiFeaturesFactory: ApiFeaturesFactory,
  ) {}

  async create(user: Partial<Admin>): Promise<Admin> {
    return await this.cmsAdminRepository.create(user);
  }

  async findOneBy(query: GenericObjectType): Promise<Admin | null> {
    return await this.cmsAdminRepository.findOne(query);
  }

  async findOne(
    query: GenericObjectType | GenericObjectType[],
    throwError = true,
  ): Promise<Partial<Admin> | null> {
    const existingUser = await this.cmsAdminRepository.findOne(query);

    if (throwError && !existingUser) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return existingUser;
  }

  async update(
    query: GenericObjectType,
    payload: Partial<Admin>,
  ): Promise<Partial<Admin>> {
    const updated = await this.cmsAdminRepository.update(query, payload);

    if (!updated) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return updated;
  }

  async save(data: Partial<Admin>): Promise<Admin> {
    return await this.cmsAdminRepository.save(data);
  }

  async delete(query: GenericObjectType): Promise<void> {
    await this.cmsAdminRepository.delete(query);
  }

  async find(paginationDto: AdvancedBasePaginationDto) {
    // return new ApiFeatures<CmsAdmin>(
    //   this.cmsAdminRepository.cmsAdminRepository,
    //   paginationDto,
    // )

    const apiFeatures = this.apiFeaturesFactory.create(
      this.cmsAdminRepository.cmsAdminRepository,
      paginationDto,
    );

    return apiFeatures
      .filter()
      .sort()
      .select([
        'id',
        'email',
        'phone',
        'status',
        'name',
        'last_login',
        'roles',
        'deleted_at',
        'created_at',
      ])
      .paginate()
      .getResults();
  }
}
