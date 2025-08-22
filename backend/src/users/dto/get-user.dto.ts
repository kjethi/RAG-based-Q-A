import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class getUserQueryDto {
  
  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
  
  @ApiProperty({required: false})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number

  @ApiProperty({required: false})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number
}
