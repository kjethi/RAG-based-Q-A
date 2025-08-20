import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

enum UserStatus {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}
export class StatusUpdateUserDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ enum: UserStatus, description: 'Status of the user' })
  @IsEnum(UserStatus)
  status?: UserStatus;
}
