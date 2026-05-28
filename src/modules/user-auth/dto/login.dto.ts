import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'password@',
    required: true,
    title: 'User password',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  readonly password: string;

  @ApiProperty({
    example: '+2348031234567',
    title: ' Phone number',
    required: true,
  })
  @IsNotEmpty({ message: ' Phone number is required.' })
  @Matches(/^[^\s]+$/, { message: ' Phone number cannot be empty.' })
  @IsString({ message: ' Phone number must be a string' })
  @IsPhoneNumber('NG', { message: 'Invalid  Phone number format' })
  readonly identifier: string;
}

// export class RefreshTokenDto {
//   @IsString()
//   @IsNotEmpty()
//   refreshToken: string;
// }
