import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIp = this.getClientIp(request);
    
    const allowedIps = this.configService.get<string>('ALLOWED_SERVICE_IPS', '127.0.0.1,localhost');
    const ipList = allowedIps.split(',').map(ip => ip.trim());
    
    if (ipList.includes(clientIp) || ipList.includes('*')) {
      return true;
    }
    
    throw new ForbiddenException(`IP ${clientIp} is not allowed to access this endpoint`);
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.ip ||
      '127.0.0.1'
    );
  }
}
