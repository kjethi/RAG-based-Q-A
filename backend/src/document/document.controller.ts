import { Controller, Get, Delete, Param, Query, Patch, Body, UseGuards } from '@nestjs/common';

import { DocumentService } from './document.service';
import { FilterDocumentDto } from './dto/filter-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  async findAll(@Query() filterDto: FilterDocumentDto) {
    return this.documentService.findAll(filterDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
