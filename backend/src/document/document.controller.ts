import { Controller, Get, Delete, Param, Query, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

import { DocumentService } from './document.service';
import { FilterDocumentDto } from './dto/filter-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsListResponseDto } from './dto/documents-list-response.dto';
import { UpdateDocumentResponseDto } from './dto/update-document-response.dto';
import { DeleteDocumentResponseDto } from './dto/delete-document-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents with optional filtering' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for filename' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by document status' })
  @ApiQuery({ name: 'offset', required: false, description: 'Pagination offset' })
  @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of documents retrieved successfully',
    type: DocumentsListResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll(@Query() filterDto: FilterDocumentDto): Promise<DocumentsListResponseDto> {
    const result = await this.documentService.findAll(filterDto);
    return {
      documents: result.documents as any, // Type assertion for now
      meta: result.meta,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document status or message' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document updated successfully',
    type: UpdateDocumentResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ): Promise<UpdateDocumentResponseDto> {
    const updatedDocument = await this.documentService.update(id, dto);
    return {
      message: 'Document updated successfully',
      document: updatedDocument as any, // Type assertion for now
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document deleted successfully',
    type: DeleteDocumentResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async remove(@Param('id') id: string): Promise<DeleteDocumentResponseDto> {
    const result = await this.documentService.remove(id);
    return {
      message: 'Document deleted successfully',
      deletedId: id,
    };
  }
}
