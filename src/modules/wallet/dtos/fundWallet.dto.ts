import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class FundWalletDto {
  @IsNotEmpty({ message: 'Amount is required.' })
  @IsNumber()
  @Min(100, { message: 'The minimum amount is 100.' })
  @ApiProperty({
    description: 'Amount to purchase',
    example: 100,
    required: true,
  })
  readonly amount: number;
}
