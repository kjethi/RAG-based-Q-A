import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { getDatabaseConfig } from './config/database.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import commonConfig from './config/common.config';
import { DocumentModule } from './document/document.module';
import { S3UploadModule } from './s3Upload/s3Upload.module';
import { QaModule } from './qa/qa.module';
import { ServiceAuthModule } from './service/service-auth.module';
import { DatabaseSeederModule } from './database/database-seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load : [commonConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    DatabaseSeederModule,
    AuthModule,
    UsersModule,
    DocumentModule,
    S3UploadModule,
    QaModule,
    ServiceAuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
