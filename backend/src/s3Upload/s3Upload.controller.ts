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
import { ApiBody, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { S3UploadService } from './s3Upload.service';
import {
  AddPendingDocumentToSqsDto,
  CompleteUploadDto,
  InitUploadDto,
  PresignPartDto,
} from './dto/S3Upload.dto';
import {
  InitUploadResponseDto,
  PresignResponseDto,
  CompleteUploadResponseDto,
  DeleteDocumentResponseDto,
  SendToSqsResponseDto,
} from './dto/s3-upload-response.dto';
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
  @ApiOperation({ summary: 'Initialize multipart upload' })
  @ApiBody({ type: InitUploadDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Upload initialized successfully',
    type: InitUploadResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async initUpload(@Body() dto: InitUploadDto): Promise<InitUploadResponseDto> {
    try {
      const uploadId = await this.s3Service.createMultipartUpload(dto.filename);
      return { uploadId };
    } catch (error) {
      console.error('Init upload failed:', error);
      throw new InternalServerErrorException('Failed to initialize upload');
    }
  }

  @Post('presign')
  @ApiOperation({ summary: 'Get presigned URL for part upload' })
  @ApiBody({ type: PresignPartDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Presigned URL generated successfully',
    type: PresignResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - missing required fields' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getPresignedUrl(@Body() dto: PresignPartDto): Promise<PresignResponseDto> {
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
  @ApiOperation({ summary: 'Complete multipart upload' })
  @ApiBody({ type: CompleteUploadDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Upload completed successfully',
    type: CompleteUploadResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - parts list required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async completeUpload(@Body() dto: CompleteUploadDto): Promise<CompleteUploadResponseDto> {
    try {
      if (!dto.parts || dto.parts.length === 0) {
        throw new BadRequestException('Parts list is required');
      }
      const result = await this.s3Service.completeMultipartUpload(
        dto.filename,
        dto.uploadId,
        dto.parts,
      );
      return {
        message: 'Upload completed successfully',
        documentId: result.documentId,
      };
    } catch (error) {
      console.error('Complete upload failed:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to complete upload');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document and S3 file' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document deleted successfully',
    type: DeleteDocumentResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async remove(@Param('id') id: string): Promise<DeleteDocumentResponseDto> {
    let document = await this.documentService.findOne(id);
    //TODO: Remove from Vector DB as well - Which we can do once we have that service ready
    if (!document) throw new BadRequestException('Document not found');
    await this.s3Service.deleteFile(document.s3Path);
    await this.documentService.remove(id);
    return {
      message: 'Document deleted successfully',
      deletedId: id,
    };
  }

  @Post('send-sqs-pending')
  @ApiOperation({ summary: 'Send document to processing queue' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document sent to queue successfully',
    type: SendToSqsResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async addPendingDocumentToSqs(@Body() body?: AddPendingDocumentToSqsDto): Promise<SendToSqsResponseDto> {
    const result = await this.s3Service.sendPendingDocuementInQueue(body?.id);
    return {
      message: result
    };
  }
}
