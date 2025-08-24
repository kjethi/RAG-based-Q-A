import { ApiProperty } from '@nestjs/swagger';

export class InitUploadResponseDto {
  @ApiProperty({ description: 'Upload ID for multipart upload' })
  uploadId: string;
}

export class PresignResponseDto {
  @ApiProperty({ description: 'Presigned URL for part upload' })
  url: string;
}

export class CompleteUploadResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Document ID if created', required: false })
  documentId?: string;
}

export class DeleteDocumentResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'ID of the deleted document' })
  deletedId: string;
}

export class SendToSqsResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
}
