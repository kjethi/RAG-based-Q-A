import { ApiProperty } from '@nestjs/swagger';
import { DocumentResponseDto } from './document-response.dto';
import { MetaDataResponseDto } from 'src/common/dto/metadata-response.dto';

export class DocumentsListResponseDto {
  @ApiProperty({ 
    description: 'Array of documents',
    type: [DocumentResponseDto]
  })
  documents: DocumentResponseDto[];

  @ApiProperty({ 
    description: 'Pagination metadata'
  })
  meta: MetaDataResponseDto;
}
