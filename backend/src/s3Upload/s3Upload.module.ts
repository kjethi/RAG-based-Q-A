import { Module } from '@nestjs/common';
import { S3UploadController } from './s3Upload.controller';
import { S3UploadService } from './s3Upload.service';
import { DocumentService } from 'src/document/document.service';
import { DocumentModule } from 'src/document/document.module';

@Module({
  imports: [DocumentModule],
  controllers: [S3UploadController],
  providers: [S3UploadService],
})
export class S3UploadModule {}
