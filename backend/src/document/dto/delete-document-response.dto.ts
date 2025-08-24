import { ApiProperty } from '@nestjs/swagger';

export class DeleteDocumentResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'ID of the deleted document' })
  deletedId: string;
}
