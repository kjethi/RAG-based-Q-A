import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class InitUploadDto {
  @ApiProperty({ example: 'file.pdf', description: 'File name to upload' })
  @IsString()
  filename: string;
}

export class PresignPartDto {
  @ApiProperty({
    example: 'file.pdf',
    description: 'File name (S3 object key)',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    example: 'abc123-upload-id',
    description: 'S3 uploadId for this multipart upload',
  })
  @IsString()
  uploadId: string;

  @ApiProperty({ example: 1, description: 'Part number (1-based index)' })
  @IsNumber()
  partNumber: number;
}

export class CompleteUploadDto {
  @ApiProperty({
    example: 'file.pdf',
    description: 'Final file name (S3 object key)',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    example: 'abc123-upload-id',
    description: 'S3 uploadId for this multipart upload',
  })
  @IsString()
  uploadId: string;

  @IsArray()
  @ApiProperty({
    type: 'array',
    description: 'List of uploaded parts with ETag and PartNumber',
    example: [
      { ETag: 'etag-part-1', PartNumber: 1 },
      { ETag: 'etag-part-2', PartNumber: 2 },
    ],
  })
  parts: { ETag: string; PartNumber: number }[];
}

export class AddPendingDocumentToSqsDto {
  @ApiProperty({ required: false, example: 'UUID' })
  @IsOptional()
  @IsString()
  id: string;
}
