import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { FilterDocumentDto } from './dto/filter-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentStatus } from '../common/enums/document-status.enum';

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: DocumentService;

  const mockDocument = {
    id: '1',
    filename: 'test-document.pdf',
    status: DocumentStatus.PENDING,
    type: 'application/pdf',
    size: 1024,
    s3Path: 's3://bucket/test-document.pdf',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDocumentService = {
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all documents without filters', async () => {
      const expectedResponse = {
        documents: [mockDocument],
        meta: { totalRecords: 1 },
      };

      mockDocumentService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(documentService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        documents: expectedResponse.documents,
        meta: expectedResponse.meta,
      });
    });

    it('should return documents with search filter', async () => {
      const filterDto: FilterDocumentDto = {
        search: 'test',
      };

      const expectedResponse = {
        documents: [mockDocument],
        meta: { totalRecords: 1 },
      };

      mockDocumentService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filterDto);

      expect(documentService.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual({
        documents: expectedResponse.documents,
        meta: expectedResponse.meta,
      });
    });

    it('should return documents with status filter', async () => {
      const filterDto: FilterDocumentDto = {
        status: DocumentStatus.COMPLETED,
      };

      const expectedResponse = {
        documents: [mockDocument],
        meta: { totalRecords: 1 },
      };

      mockDocumentService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filterDto);

      expect(documentService.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual({
        documents: expectedResponse.documents,
        meta: expectedResponse.meta,
      });
    });

    it('should return documents with pagination filters', async () => {
      const filterDto: FilterDocumentDto = {
        offset: 5,
        limit: 20,
      };

      const expectedResponse = {
        documents: [mockDocument],
        meta: { totalRecords: 1 },
      };

      mockDocumentService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filterDto);

      expect(documentService.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual({
        documents: expectedResponse.documents,
        meta: expectedResponse.meta,
      });
    });

    it('should return documents with combined filters', async () => {
      const filterDto: FilterDocumentDto = {
        search: 'test',
        status: DocumentStatus.PENDING,
        offset: 0,
        limit: 10,
      };

      const expectedResponse = {
        documents: [mockDocument],
        meta: { totalRecords: 1 },
      };

      mockDocumentService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filterDto);

      expect(documentService.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual({
        documents: expectedResponse.documents,
        meta: expectedResponse.meta,
      });
    });
  });

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      const documentId = '1';
      const updateDto: UpdateDocumentDto = {
        status: DocumentStatus.COMPLETED,
        message: 'Document processed successfully',
      };

      const updatedDocument = { ...mockDocument, ...updateDto };
      mockDocumentService.update.mockResolvedValue(updatedDocument);

      const result = await controller.updateDocument(documentId, updateDto);

      expect(documentService.update).toHaveBeenCalledWith(documentId, updateDto);
      expect(result).toEqual({
        message: 'Document updated successfully',
        document: updatedDocument,
      });
    });

    it('should handle document update with partial data', async () => {
      const documentId = '1';
      const updateDto: UpdateDocumentDto = {
        status: DocumentStatus.FAILED,
      };

      const updatedDocument = { ...mockDocument, status: DocumentStatus.FAILED };
      mockDocumentService.update.mockResolvedValue(updatedDocument);

      const result = await controller.updateDocument(documentId, updateDto);

      expect(documentService.update).toHaveBeenCalledWith(documentId, updateDto);
      expect(result).toEqual({
        message: 'Document updated successfully',
        document: updatedDocument,
      });
    });

    it('should handle document update with only message', async () => {
      const documentId = '1';
      const updateDto: UpdateDocumentDto = {
        message: 'Custom message for document',
      };

      const updatedDocument = { ...mockDocument, message: 'Custom message for document' };
      mockDocumentService.update.mockResolvedValue(updatedDocument);

      const result = await controller.updateDocument(documentId, updateDto);

      expect(documentService.update).toHaveBeenCalledWith(documentId, updateDto);
      expect(result).toEqual({
        message: 'Document updated successfully',
        document: updatedDocument,
      });
    });
  });

  describe('remove', () => {
    it('should delete document successfully', async () => {
      const documentId = '1';

      mockDocumentService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(documentId);

      expect(documentService.remove).toHaveBeenCalledWith(documentId);
      expect(result).toEqual({
        message: 'Document deleted successfully',
        deletedId: documentId,
      });
    });

    it('should handle document deletion with different ID', async () => {
      const documentId = '999';

      mockDocumentService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(documentId);

      expect(documentService.remove).toHaveBeenCalledWith(documentId);
      expect(result).toEqual({
        message: 'Document deleted successfully',
        deletedId: documentId,
      });
    });
  });
});
