import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { User } from 'src/database/entities';
import { TransactionType } from './enum/wallet.enum';
import { ResponseFormat } from 'src/common/utils/ResponseFormat';
import { Helpers } from 'src/common/utils/helper-utils';
import { FundWalletDto } from './dtos/fundWallet.dto';
import type { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CustomerJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/database/enums';

@ApiTags('Wallet')
@ApiBearerAuth('CustomerJWT')
@Controller('wallet')
@UseGuards(CustomerJwtGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class WalletController {
  private readonly logger = new Logger(WalletController.name);
  constructor(private readonly walletService: WalletService) {}

  @Post('credit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Credit a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet credited successfully' })
  async creditWallet(
    @Body() payload: FundWalletDto,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    console.log('🔍 user.id =', user.id, typeof user.id); // 👈 add this
    console.log('🔍 query =', { user_id: user.id });
    const query = { user: { id: user.id } };
    await this.walletService.creditWallet(query, {
      user_id: user.id,
      amount: payload.amount,
      transaction_id: Helpers.generateReference(),
      transaction_type: TransactionType.CREDIT,
    });

    return ResponseFormat.ok(res, 'Wallet credited successfully');
  }
}
