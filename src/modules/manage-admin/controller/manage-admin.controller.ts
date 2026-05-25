import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ManageAdminService } from '../service';
import { CreateAdminDto, UpdateAdminDto } from '../dto';
import type { Response } from 'express';
import { ResponseFormat } from 'src/common/utils';
import { AdministratorType } from 'src/database/enums/user.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { AdminJwtGuard } from 'src/modules/admin-auth/guards/admin-jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';

@ApiTags('Manage admin module')
@Controller('admin')
@ApiBearerAuth('AdminJWT')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdministratorType.ADMIN)
export class ManageAdminController {
  constructor(private readonly adminService: ManageAdminService) {}

  @ApiOperation({
    summary: 'Create a new user',
    description: 'Registers a new user in the system.',
  })
  @ApiOkResponse({
    description: 'Record created successfully',
  })
  @ApiBody({
    type: CreateAdminDto,
    description: 'Payload to create a user.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access.',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or required parameters missing.',
  })
  @Post('create')
  async create(@Body() createAdminDto: CreateAdminDto, @Res() res: Response) {
    const admin = await this.adminService.create(createAdminDto);
    return ResponseFormat.success(res, 'Successful', admin);
  }

  @Get('id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiParam({ name: 'id', description: 'admin ID' })
  @ApiOkResponse({ description: 'admin retrieved successfully' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  async findAll(@Res() res: Response, @Param('id') id: string) {
    const admin = await this.adminService.findOne({ id });
    return ResponseFormat.success(res, 'Admin retrieved successfully', admin);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin details' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiOkResponse({ description: 'admin updated successfully' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  async update(
    @Res() res: Response,
    @Body() { user_id, ...rest }: UpdateAdminDto,
  ) {
    await this.adminService.update({ id: user_id }, rest);

    return ResponseFormat.ok(res, 'admin updated successfully');
  }
}
