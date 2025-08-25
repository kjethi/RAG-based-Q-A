import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { S3UploadController } from './s3Upload.controller';
import { S3UploadService } from './s3Upload.service';
import { DocumentService } from '../document/document.service';
import { InitUploadDto } from './dto/S3Upload.dto';
import { PresignPartDto } from './dto/S3Upload.dto';
import { CompleteUploadDto } from './dto/S3Upload.dto';
import { AddPendingDocumentToSqsDto } from './dto/S3Upload.dto';

describe('S3UploadController', () => {
  let controller: S3UploadController;
  let s3Service: S3UploadService;
  let documentService: DocumentService;

  const mockS3Service = {
    createMultipartUpload: jest.fn(),
    getPresignedUrl: jest.fn(),
    completeMultipartUpload: jest.fn(),
    deleteFile: jest.fn(),
    sendPendingDocuementInQueue: jest.fn(),
  };

  const mockDocumentService = {
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockDocument = {
    id: 'doc1',
    filename: 'test-file.pdf',
    s3Path: 's3://bucket/test-file.pdf',
    type: 'application/pdf',
    size: 1024,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [S3UploadController],
      providers: [
        {
          provide: S3UploadService,
          useValue: mockS3Service,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    controller = module.get<S3UploadController>(S3UploadController);
    s3Service = module.get<S3UploadService>(S3UploadService);
    documentService = module.get<DocumentService>(DocumentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initUpload', () => {
    it('should initialize upload successfully', async () => {
      const initUploadDto: InitUploadDto = {
        filename: 'test-file.pdf',
      };

      const uploadId = 'upload-123';
      mockS3Service.createMultipartUpload.mockResolvedValue(uploadId);

      const result = await controller.initUpload(initUploadDto);

      expect(s3Service.createMultipartUpload).toHaveBeenCalledWith(initUploadDto.filename);
      expect(result).toEqual({ uploadId });
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      const initUploadDto: InitUploadDto = {
        filename: 'test-file.pdf',
      };

      const error = new Error('S3 service error');
      mockS3Service.createMultipartUpload.mockRejectedValue(error);

      await expect(controller.initUpload(initUploadDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(s3Service.createMultipartUpload).toHaveBeenCalledWith(initUploadDto.filename);
    });
  });

  describe('getPresignedUrl', () => {
    it('should return presigned URL successfully', async () => {
      const presignPartDto: PresignPartDto = {
        filename: 'test-file.pdf',
        uploadId: 'upload-123',
        partNumber: 1,
      };

      const presignedUrl = 'https://presigned-url.com';
      mockS3Service.getPresignedUrl.mockResolvedValue(presignedUrl);

      const result = await controller.getPresignedUrl(presignPartDto);

      expect(s3Service.getPresignedUrl).toHaveBeenCalledWith(
        presignPartDto.filename,
        presignPartDto.uploadId,
        presignPartDto.partNumber,
      );
      expect(result).toEqual({ url: presignedUrl });
    });

    it('should throw BadRequestException when filename is missing', async () => {
      const presignPartDto: PresignPartDto = {
        filename: '',
        uploadId: 'upload-123',
        partNumber: 1,
      };

      await expect(controller.getPresignedUrl(presignPartDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(s3Service.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when uploadId is missing', async () => {
      const presignPartDto: PresignPartDto = {
        filename: 'test-file.pdf',
        uploadId: '',
        partNumber: 1,
      };

      await expect(controller.getPresignedUrl(presignPartDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(s3Service.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when partNumber is missing', async () => {
      const presignPartDto: PresignPartDto = {
        filename: 'test-file.pdf',
        uploadId: 'upload-123',
        partNumber: 0,
      };

      await expect(controller.getPresignedUrl(presignPartDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(s3Service.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      const presignPartDto: PresignPartDto = {
        filename: 'test-file.pdf',
        uploadId: 'upload-123',
        partNumber: 1,
      };

      const error = new Error('S3 service error');
      mockS3Service.getPresignedUrl.mockRejectedValue(error);

      await expect(controller.getPresignedUrl(presignPartDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(s3Service.getPresignedUrl).toHaveBeenCalledWith(
        presignPartDto.filename,
        presignPartDto.uploadId,
        presignPartDto.partNumber,
      );
    });
  });

  describe('completeUpload', () => {
    it('should complete upload successfully', async () => {
      const completeUploadDto: CompleteUploadDto = {
        filename: 'test-file.pdf',
        uploadId: 'upload-123',
        parts: [
          { ETag: 'etag1', PartNumber: 1 },
          { ETag: 'etag2', PartNumber: 2 },
        ],
      };

      const uploadResult = {
        location: 'https://bucket.s3.amazonaws.com/test-file.pdf',
        file: mockDocument,
        documentId: 'doc1',
      };

      mockS3Service.completeMultipartUpload.mockResolvedValue(uploadResult);

      const result = await controller.completeUpload(completeUploadDto);

      expect(s3Service.completeMultipartUpload).toHaveBeenCalledWith(
        completeUploadDto.filename,
        completeUploadDto.uploadId,
        completeUploadDto.parts,
      );
      expect(result).toEqual({
        message: 'Upload completed successfully',
        documentId: 'doc1',
      });
    });

    it('should throw BadRequestException when parts list is empty', async () => {
      const completeUploadDto: CompleteUploadDto = {
        filename: 'test-file.pdf',
        uploadId: 'upload-123',
        parts: [],
      };

      await expect(controller.completeUpload(completeUploadDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(s3Service.completeMultipartUpload).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when parts list is missing', async () => {
      const completeUploadDto: CompleteUploadDto = {
        filename: 'test-file.pdf',
        uploadId: 'upload-123',
        parts: undefined as any,
      };

      await expect(controller.completeUpload(completeUploadDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(s3Service.completeMultipartUpload).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      const completeUploadDto: CompleteUploadDto = {
        filename: 'test-file.pdf',
        uploadId: 'upload-123',
        parts: [
          { ETag: 'etag1', PartNumber: 1 },
        ],
      };

      const error = new Error('S3 service error');
      mockS3Service.completeMultipartUpload.mockRejectedValue(error);

      await expect(controller.completeUpload(completeUploadDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(s3Service.completeMultipartUpload).toHaveBeenCalledWith(
        completeUploadDto.filename,
        completeUploadDto.uploadId,
        completeUploadDto.parts,
      );
    });
  });

  describe('remove', () => {
    it('should delete document successfully', async () => {
      const documentId = 'doc1';

      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      mockS3Service.deleteFile.mockResolvedValue({ message: 'File deleted' });
      mockDocumentService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(documentId);

      expect(documentService.findOne).toHaveBeenCalledWith(documentId);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(mockDocument.s3Path);
      expect(documentService.remove).toHaveBeenCalledWith(documentId);
      expect(result).toEqual({
        message: 'Document deleted successfully',
        deletedId: documentId,
      });
    });

    it('should throw BadRequestException when document not found', async () => {
      const documentId = 'doc1';

      mockDocumentService.findOne.mockResolvedValue(null);

      await expect(controller.remove(documentId)).rejects.toThrow(
        BadRequestException,
      );

      expect(documentService.findOne).toHaveBeenCalledWith(documentId);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
      expect(documentService.remove).not.toHaveBeenCalled();
    });
  });

  describe('addPendingDocumentToSqs', () => {
    it('should send specific document to queue successfully', async () => {
      const body: AddPendingDocumentToSqsDto = {
        id: 'doc1',
      };

      const queueResult = '1 document(s) sent to queue';
      mockS3Service.sendPendingDocuementInQueue.mockResolvedValue(queueResult);

      const result = await controller.addPendingDocumentToSqs(body);

      expect(s3Service.sendPendingDocuementInQueue).toHaveBeenCalledWith('doc1');
      expect(result).toEqual({
        message: queueResult,
      });
    });

    it('should send all pending documents to queue when no ID provided', async () => {
      const queueResult = '5 document(s) sent to queue';
      mockS3Service.sendPendingDocuementInQueue.mockResolvedValue(queueResult);

      const result = await controller.addPendingDocumentToSqs();

      expect(s3Service.sendPendingDocuementInQueue).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        message: queueResult,
      });
    });

    it('should handle empty body parameter', async () => {
      const queueResult = 'No documents are there to sent in queue ';
      mockS3Service.sendPendingDocuementInQueue.mockResolvedValue(queueResult);

      const result = await controller.addPendingDocumentToSqs();

      expect(s3Service.sendPendingDocuementInQueue).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        message: queueResult,
      });
    });
  });
});
