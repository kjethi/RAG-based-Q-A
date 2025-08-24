import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ServiceAuthGuard } from '../guards/service-auth.guard';
import { DocumentService } from '../../document/document.service';
import { DocumentStatus } from 'src/common/enums/document-status.enum';

@ApiTags('Public Service Endpoints')
@Controller('public-service')
export class PublicServiceController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('update-injection-status')
  @UseGuards(ServiceAuthGuard) // Use service auth instead of JWT auth
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update document injection status (Service only)' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'Document ID' },
        status: { type: 'string', description: 'New status' },
        message: { type: 'string', description: 'Status message' }
      },
      required: ['documentId', 'status']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Invalid service token' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async updateInjectionStatus(@Body() body: {
    documentId: string;
    status: DocumentStatus;
    message?: string;
  }) {
    const { documentId, status, message } = body;
    
    // Update the document status
    const updatedDocument = await this.documentService.update(documentId, {
      status,
      message,
    });

    return {
      message: 'Injection status updated successfully',
      documentId,
      status,
      updatedAt: updatedDocument.updatedAt,
    };
  }
}
