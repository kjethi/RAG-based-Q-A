import { Controller, Get, Delete, Param, Query, Patch, Body } from '@nestjs/common';

import { DocumentService } from './document.service';
import { FilterDocumentDto } from './dto/filter-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  async findAll(@Query() filterDto: FilterDocumentDto) {
    return this.documentService.findAll(filterDto);
  }

  @Patch(':id')
  async updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
