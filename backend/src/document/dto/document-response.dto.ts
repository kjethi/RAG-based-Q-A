import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from 'src/common/enums/document-status.enum';

export class DocumentResponseDto {
  @ApiProperty({ description: 'Unique identifier for the document' })
  id: string;

  @ApiProperty({ description: 'Original filename of the document' })
  filename: string;

  @ApiProperty({ description: 'S3 path where the document is stored' })
  s3Path: string;

  @ApiProperty({ description: 'File type/mime type of the document' })
  type: string;

  @ApiProperty({ description: 'Size of the document in bytes' })
  size: number;

  @ApiProperty({ 
    description: 'Current processing status of the document',
    enum: DocumentStatus 
  })
  status: DocumentStatus;

  @ApiProperty({ 
    description: 'Optional message about the document status',
    required: false 
  })
  message?: string;

  @ApiProperty({ description: 'When the document was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the document was last updated' })
  updatedAt: Date;
}
