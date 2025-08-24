import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { MetaDataResponseDto } from '../../common/dto/metadata-response.dto';

export class UserResponseDto {
  @ApiProperty({ description: 'Unique user identifier' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  name: string;

  @ApiProperty({ 
    description: 'User role in the system',
    enum: UserRole 
  })
  role: UserRole;

  @ApiProperty({ description: 'Whether the user account is active' })
  isActive: boolean;

  @ApiProperty({ description: 'When the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the user was last updated' })
  updatedAt: Date;
}

export class UsersListResponseDto {
  @ApiProperty({ 
    description: 'Array of users',
    type: [UserResponseDto]
  })
  users: UserResponseDto[];

  @ApiProperty({ 
    description: 'Pagination metadata',
    type: MetaDataResponseDto
  })
  meta: MetaDataResponseDto;
}

export class UpdateUserResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ 
    description: 'Updated user data',
    type: UserResponseDto
  })
  user: UserResponseDto;
}

export class ChangeStatusResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'New status' })
  isActive: boolean;
}
