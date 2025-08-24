import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ServiceAuthDto {
  @ApiProperty({ description: 'Service identifier' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: 'Service secret key' })
  @IsString()
  @IsNotEmpty()
  serviceSecret: string;
}

export class ServiceAuthResponseDto {
  @ApiProperty({ description: 'Service access token' })
  accessToken: string;

  @ApiProperty({ description: 'Token expiration time' })
  expiresIn: number;
}
