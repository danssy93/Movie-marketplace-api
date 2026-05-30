import { Controller, Get, Logger, Query, Res, UseGuards } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { BasePaginationWithDateDto } from 'src/modules/movie/dtos/pagination.dto';
import type { Response } from 'express';
import { ResponseFormat } from 'src/common/utils';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { User } from 'src/database/entities';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { AdministratorType, Role } from 'src/database/enums';
import { AdminJwtGuard } from 'src/modules/admin-auth/guards/admin-jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CustomerJwtGuard } from 'src/modules/user-auth/guards/user-jwt.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth('AdminJWT')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles(AdministratorType.ADMIN, AdministratorType.SUPERADMIN)
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  @Get('admin')
  async getAdminDashboard(
    @Query() filter: BasePaginationWithDateDto,
    @Res() res: Response,
  ) {
    const data = await this.dashboardService.getAdminDashboard(filter);
    return ResponseFormat.success(res, 'Dashboard data retrieved', data);
  }

  @ApiBearerAuth('CustomerJWT')
  @UseGuards(CustomerJwtGuard, RolesGuard)
  @Roles(Role.AUTHOR)
  @ApiOperation({ summary: 'Get author dashboard stats' })
  @Get('author')
  async getAuthorDashboard(
    @Query() filter: BasePaginationWithDateDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const data = await this.dashboardService.getAuthorDashboard(
      Number(user.id),
      filter,
    );
    return ResponseFormat.success(res, 'Dashboard data retrieved', data);
  }

  @ApiBearerAuth('CustomerJWT')
  @UseGuards(CustomerJwtGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Get customer dashboard stats' })
  @Get('customer')
  async getCustomerDashboard(
    @Query() filter: BasePaginationWithDateDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const data = await this.dashboardService.getCustomerDashboard(
      Number(user.id),
      filter,
    );
    return ResponseFormat.success(res, 'Dashboard data retrieved', data);
  }
}
