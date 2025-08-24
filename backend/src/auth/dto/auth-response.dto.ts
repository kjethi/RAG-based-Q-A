import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

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

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  token: string;

  @ApiProperty({ 
    description: 'User information',
    type: UserResponseDto
  })
  user: UserResponseDto;
}

export class RegisterResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  token: string;

  @ApiProperty({ 
    description: 'User information',
    type: UserResponseDto
  })
  user: UserResponseDto;
}

export class ProfileResponseDto {
  @ApiProperty({ 
    description: 'User profile information',
    type: UserResponseDto
  })
  user: UserResponseDto;
}

export class AdminOnlyResponseDto {
  @ApiProperty({ description: 'Admin access confirmation message' })
  message: string;
}
