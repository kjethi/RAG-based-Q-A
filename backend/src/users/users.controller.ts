import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { 
  UsersListResponseDto, 
  UpdateUserResponseDto, 
  ChangeStatusResponseDto 
} from './dto/user-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { StatusUpdateUserDto } from './dto/status-update-user.dto';
import { getUserQueryDto } from './dto/get-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name or email' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by user role' })
  @ApiQuery({ name: 'offset', required: false, description: 'Pagination offset' })
  @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of users retrieved successfully',
    type: UsersListResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @Roles(UserRole.ADMIN)
  async findAll(@Query() filterQuery?: getUserQueryDto): Promise<UsersListResponseDto> { 
    return this.usersService.findAll(filterQuery);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user information (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    type: UpdateUserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return {
      message: 'User updated successfully',
      user: updatedUser as any, // Type assertion for now
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change user status (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User status changed successfully',
    type: ChangeStatusResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param() params: StatusUpdateUserDto): Promise<ChangeStatusResponseDto> {
    const { id, status } = params;
    const isActive = status === 'deactivate';
    await this.usersService.changeStatus(id, isActive);
    return {
      message: 'User status changed successfully',
      userId: id,
      isActive: !isActive, // Opposite of deactivate
    };
  }
}
