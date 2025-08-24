import { ApiProperty } from '@nestjs/swagger';

export class MetaDataResponseDto {
  @ApiProperty({ description: 'Total number of records' })
  totalRecords: number;

  @ApiProperty({ description: 'Current page number', required: false })
  page?: number;

  @ApiProperty({ description: 'Number of records per page', required: false })
  limit?: number;

  @ApiProperty({ description: 'Total number of pages', required: false })
  totalPages?: number;
}
