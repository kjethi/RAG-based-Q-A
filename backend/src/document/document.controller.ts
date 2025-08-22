import { Controller, Get, Delete, Param, Query } from '@nestjs/common';

import { DocumentService } from './document.service';
import { FilterDocumentDto } from './dto/filter-document.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  async findAll(@Query() filterDto: FilterDocumentDto) {
    return this.documentService.findAll(filterDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
