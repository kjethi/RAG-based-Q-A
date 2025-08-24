import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ServiceAuthDto, ServiceAuthResponseDto } from './dto/service-auth.dto';

@Injectable()
export class ServiceAuthService {
  private readonly serviceCredentials: Map<string, string>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Initialize service credentials from environment variables
    this.serviceCredentials = new Map();
    
    // You can add multiple services here
    const pythonServiceId = this.configService.get<string>('SERVICE_PYTHON_ID', 'python-rag-service');
    const pythonServiceSecret = this.configService.get<string>('SERVICE_PYTHON_SECRET');
    
    if (pythonServiceSecret) {
      this.serviceCredentials.set(pythonServiceId, pythonServiceSecret);
    }
  }

  async authenticateService(authDto: ServiceAuthDto): Promise<ServiceAuthResponseDto> {
    const storedSecret = this.serviceCredentials.get(authDto.serviceId);
    
    if (!storedSecret || storedSecret !== authDto.serviceSecret) {
      throw new UnauthorizedException('Invalid service credentials');
    }

    // Generate a service token with limited permissions
    const payload = {
      sub: authDto.serviceId,
      type: 'service',
      permissions: ['service:read', 'service:write'],
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('SERVICE_TOKEN_EXPIRES_IN', '1h'),
    });

    return {
      accessToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  validateServiceToken(token: string): boolean {
    try {
      const payload = this.jwtService.verify(token);
      return payload.type === 'service' && payload.sub;
    } catch {
      return false;
    }
  }
}
