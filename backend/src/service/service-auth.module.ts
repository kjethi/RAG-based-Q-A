import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServiceAuthService } from './service-auth.service';
import { ServiceAuthController } from './controllers/service-auth.controller';
import { PublicServiceController } from './controllers/public-service.controller';
import { ServiceAuthGuard } from './guards/service-auth.guard';
import { DocumentService } from 'src/document/document.service';
import { DocumentModule } from 'src/document/document.module';

@Module({
  imports: [
    DocumentModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('SERVICE_TOKEN_EXPIRES_IN', '1h') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ServiceAuthController, PublicServiceController],
  providers: [ServiceAuthService, ServiceAuthGuard],
  exports: [ServiceAuthService, ServiceAuthGuard],
})
export class ServiceAuthModule {}
