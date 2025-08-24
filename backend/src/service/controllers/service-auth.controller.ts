import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServiceAuthService } from '../service-auth.service';
import { ServiceAuthDto, ServiceAuthResponseDto } from '../dto/service-auth.dto';

@ApiTags('Service Authentication')
@Controller('service-auth')
export class ServiceAuthController {
  constructor(private readonly serviceAuthService: ServiceAuthService) {}

  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate service and get access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service authenticated successfully',
    type: ServiceAuthResponseDto
  })
  @ApiResponse({ status: 401, description: 'Invalid service credentials' })
  async authenticateService(@Body() authDto: ServiceAuthDto): Promise<ServiceAuthResponseDto> {
    console.log("authDto",authDto);
    
    return this.serviceAuthService.authenticateService(authDto);
  }
}
