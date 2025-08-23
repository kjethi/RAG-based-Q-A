import {
  Body,
  Controller,
  Post,
  BadRequestException,
  InternalServerErrorException,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { S3UploadService } from './s3Upload.service';
import {
  AddPendingDocumentToSqsDto,
  CompleteUploadDto,
  InitUploadDto,
  PresignPartDto,
} from './dto/S3Upload.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { DocumentService } from 'src/document/document.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

@ApiTags('S3 Upload')
@Controller('s3-upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class S3UploadController {
  constructor(
    private readonly s3Service: S3UploadService,
    private documentService: DocumentService,
  ) {}

  @Post('init')
  @ApiBody({ type: InitUploadDto })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async initUpload(@Body() dto: InitUploadDto) {
    try {
      const uploadId = await this.s3Service.createMultipartUpload(dto.filename);
      return { uploadId };
    } catch (error) {
      console.error('Init upload failed:', error);
      throw new InternalServerErrorException('Failed to initialize upload');
    }
  }

  @Post('presign')
  @ApiBody({ type: PresignPartDto })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getPresignedUrl(@Body() dto: PresignPartDto) {
    try {
      if (!dto.filename || !dto.uploadId || !dto.partNumber) {
        throw new BadRequestException(
          'filename, uploadId, and partNumber are required',
        );
      }
      const url = await this.s3Service.getPresignedUrl(
        dto.filename,
        dto.uploadId,
        dto.partNumber,
      );
      return { url };
    } catch (error) {
      console.error('Presign failed:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Failed to generate presigned URL',
      );
    }
  }

  @Post('complete')
  @ApiBody({ type: CompleteUploadDto })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async completeUpload(@Body() dto: CompleteUploadDto) {
    try {
      if (!dto.parts || dto.parts.length === 0) {
        throw new BadRequestException('Parts list is required');
      }
      return await this.s3Service.completeMultipartUpload(
        dto.filename,
        dto.uploadId,
        dto.parts,
      );
    } catch (error) {
      console.error('Complete upload failed:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to complete upload');
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async remove(@Param('id') id: string) {
    let document = await this.documentService.findOne(id);
    //TODO: Remove from Vector DB as well - Which we can do once we have that service ready
    if (!document) throw new BadRequestException('Document not found');
    await this.s3Service.deleteFile(document.s3Path);
    return this.documentService.remove(id);
  }

  @Post('send-sqs-pending')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async addPendingDocumentToSqs(@Body() body?: AddPendingDocumentToSqsDto) {
    return this.s3Service.sendPendingDocuementInQueue(body?.id);
  }
}
