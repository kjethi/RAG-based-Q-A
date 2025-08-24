import { ApiProperty } from '@nestjs/swagger';

export class SourceResponseDto {
  @ApiProperty({ description: 'Unique source identifier' })
  id: string;

  @ApiProperty({ description: 'Doc id is document id' })
  documentId: string;

  @ApiProperty({ description: 'Source document title' })
  title: string;

  @ApiProperty({ description: 'Relevant text snippet from source' })
  snippet: string;

  @ApiProperty({ 
    description: 'Relevance score (0-1)',
    minimum: 0,
    maximum: 1
  })
  score: number;
}

export class QAResponseDto {
  @ApiProperty({ description: 'Generated answer to the question' })
  answer: string;

  @ApiProperty({ 
    description: 'Relevant sources used to generate the answer',
    type: [SourceResponseDto]
  })
  sources: SourceResponseDto[];
}
