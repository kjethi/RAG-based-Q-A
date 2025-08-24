import { ApiProperty } from '@nestjs/swagger';
import { DocumentResponseDto } from './document-response.dto';

export class UpdateDocumentResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ 
    description: 'Updated document data',
    type: DocumentResponseDto
  })
  document: DocumentResponseDto;
}
