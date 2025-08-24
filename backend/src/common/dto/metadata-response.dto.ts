import { ApiProperty } from '@nestjs/swagger';

export class MetaDataResponseDto {
  @ApiProperty({ description: 'Total number of documents' })
  totalRecords: number;

}
