import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DocumentStatus } from 'src/common/enums/document-status.enum';

export class UpdateDocumentDto {
  @ApiProperty({ required: false, enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
