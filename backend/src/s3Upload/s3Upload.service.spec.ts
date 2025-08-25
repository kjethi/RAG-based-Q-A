import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';
import { DocumentService } from '../document/document.service';
import { DocumentStatus } from '../common/enums/document-status.enum';
import { S3UploadService } from './s3Upload.service';

// Mock AWS SDK clients
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-sqs');
jest.mock('@aws-sdk/s3-request-presigner');

const mockS3Client = {
  send: jest.fn(),
};

const mockSQSClient = {
  send: jest.fn(),
};

const mockGetSignedUrl = jest.fn();

describe('S3UploadService', () => {
  let service: S3UploadService;
  let configService: ConfigService;
  let documentService: DocumentService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockDocumentService = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };

  const mockDocument = {
    id: 'doc1',
    filename: 'test-file.pdf',
    status: DocumentStatus.PENDING,
    type: 'application/pdf',
    size: 1024,
    s3Path: 's3://bucket/test-file.pdf',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Mock AWS SDK constructors
    (S3Client as jest.MockedClass<typeof S3Client>).mockImplementation(() => mockS3Client as any);
    (SQSClient as jest.MockedClass<typeof SQSClient>).mockImplementation(() => mockSQSClient as any);
    
    // Mock getSignedUrl function
    require('@aws-sdk/s3-request-presigner').getSignedUrl = mockGetSignedUrl;

    // Set default mock values for AWS configuration
    mockConfigService.get
      .mockReturnValueOnce('us-east-1') // AWS_REGION
      .mockReturnValueOnce('test-access-key') // AWS_ACCESS_KEY_ID
      .mockReturnValueOnce('test-secret-key') // AWS_SECRET_ACCESS_KEY
      .mockReturnValueOnce('https://sqs.queue.url') // AWS_SQS_QUEUE_URL
      .mockReturnValueOnce('test-bucket'); // AWS_S3_BUCKET

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3UploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    service = module.get<S3UploadService>(S3UploadService);
    configService = module.get<ConfigService>(ConfigService);
    documentService = module.get<DocumentService>(DocumentService);
  });

  describe('constructor', () => {
    it('should initialize with valid AWS configuration', () => {
      mockConfigService.get
        .mockReturnValueOnce('us-east-1') // AWS_REGION
        .mockReturnValueOnce('test-access-key') // AWS_ACCESS_KEY_ID
        .mockReturnValueOnce('test-secret-key') // AWS_SECRET_ACCESS_KEY
        .mockReturnValueOnce('https://sqs.queue.url') // AWS_SQS_QUEUE_URL
        .mockReturnValueOnce('test-bucket'); // AWS_S3_BUCKET

      expect(() => new S3UploadService(configService, documentService)).not.toThrow();
    });

    it('should throw error when AWS_REGION is missing', () => {
      mockConfigService.get
        .mockReturnValueOnce(undefined) // AWS_REGION
        .mockReturnValueOnce('test-access-key') // AWS_ACCESS_KEY_ID
        .mockReturnValueOnce('test-secret-key'); // AWS_SECRET_ACCESS_KEY

      expect(() => new S3UploadService(configService, documentService)).toThrow(
        'Missing AWS configuration: region, accessKeyId, or secretAccessKey'
      );
    });

    it('should throw error when AWS_ACCESS_KEY_ID is missing', () => {
      mockConfigService.get
        .mockReturnValueOnce('us-east-1') // AWS_REGION
        .mockReturnValueOnce(undefined) // AWS_ACCESS_KEY_ID
        .mockReturnValueOnce('test-secret-key'); // AWS_SECRET_ACCESS_KEY

      expect(() => new S3UploadService(configService, documentService)).toThrow(
        'Missing AWS configuration: region, accessKeyId, or secretAccessKey'
      );
    });

    it('should throw error when AWS_SECRET_ACCESS_KEY is missing', () => {
      mockConfigService.get
        .mockReturnValueOnce('us-east-1') // AWS_REGION
        .mockReturnValueOnce('test-access-key') // AWS_ACCESS_KEY_ID
        .mockReturnValueOnce(undefined); // AWS_SECRET_ACCESS_KEY

      expect(() => new S3UploadService(configService, documentService)).toThrow(
        'Missing AWS configuration: region, accessKeyId, or secretAccessKey'
      );
    });

    it('should throw error when AWS_SQS_QUEUE_URL is missing', () => {
      mockConfigService.get
        .mockReturnValueOnce('us-east-1') // AWS_REGION
        .mockReturnValueOnce('test-access-key') // AWS_ACCESS_KEY_ID
        .mockReturnValueOnce('test-secret-key') // AWS_SECRET_ACCESS_KEY
        .mockReturnValueOnce(undefined) // AWS_SQS_QUEUE_URL
        .mockReturnValueOnce('test-bucket'); // AWS_S3_BUCKET

      expect(() => new S3UploadService(configService, documentService)).toThrow(
        'SQS_QUEUE_URL is not defined in environment variables'
      );
    });

    it('should throw error when AWS_S3_BUCKET is missing', () => {
      mockConfigService.get
        .mockReturnValueOnce('us-east-1') // AWS_REGION
        .mockReturnValueOnce('test-access-key') // AWS_ACCESS_KEY_ID
        .mockReturnValueOnce('test-secret-key') // AWS_SECRET_ACCESS_KEY
        .mockReturnValueOnce('https://sqs.queue.url') // AWS_SQS_QUEUE_URL
        .mockReturnValueOnce(undefined); // AWS_S3_BUCKET

      expect(() => new S3UploadService(configService, documentService)).toThrow(
        'AWS_S3_BUCKET is not defined in environment variables'
      );
    });
  });

  describe('createMultipartUpload', () => {
    it('should create multipart upload successfully', async () => {
      const key = 'test-file.pdf';
      const uploadId = 'upload-123';
      
      mockS3Client.send.mockResolvedValue({
        UploadId: uploadId,
      });

      const result = await service.createMultipartUpload(key);

      expect(mockS3Client.send).toHaveBeenCalled();
      expect(result).toBe(uploadId);
    });
  });

  describe('getPresignedUrl', () => {
    it('should return presigned URL for upload part', async () => {
      const key = 'test-file.pdf';
      const uploadId = 'upload-123';
      const partNumber = 1;
      const presignedUrl = 'https://presigned-url.com';

      mockGetSignedUrl.mockResolvedValue(presignedUrl);

      const result = await service.getPresignedUrl(key, uploadId, partNumber);

      expect(mockGetSignedUrl).toHaveBeenCalled();
      expect(result).toBe(presignedUrl);
    });
  });

  describe('completeMultipartUpload', () => {
    it('should complete multipart upload and create document', async () => {
      const key = 'test-file.pdf';
      const uploadId = 'upload-123';
      const parts = [
        { ETag: 'etag1', PartNumber: 1 },
        { ETag: 'etag2', PartNumber: 2 },
      ];

      const s3Result = {
        Location: 'https://bucket.s3.amazonaws.com/test-file.pdf',
      };

      const headResult = {
        ContentType: 'application/pdf',
        ContentLength: 2048,
      };

      mockS3Client.send
        .mockResolvedValueOnce(s3Result) // CompleteMultipartUploadCommand
        .mockResolvedValueOnce(headResult); // HeadObjectCommand

      mockDocumentService.create.mockResolvedValue(mockDocument);
      mockSQSClient.send.mockResolvedValue({});

      const result = await service.completeMultipartUpload(key, uploadId, parts);

      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
      expect(mockDocumentService.create).toHaveBeenCalledWith({
        filename: key,
        mimetype: headResult.ContentType,
        size: headResult.ContentLength,
        s3Path: s3Result.Location,
      });
      expect(result).toEqual({
        location: s3Result.Location,
        file: mockDocument,
        documentId: mockDocument.id,
      });
    });
  });

  describe('abortMultipartUpload', () => {
    it('should abort multipart upload successfully', async () => {
      const key = 'test-file.pdf';
      const uploadId = 'upload-123';

      mockS3Client.send.mockResolvedValue({});

      await service.abortMultipartUpload(key, uploadId);

      expect(mockS3Client.send).toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const key = 'test-file.pdf';
      const bucket = 'test-bucket';

      // Mock process.env
      const originalEnv = process.env;
      process.env = { ...originalEnv, AWS_BUCKET: bucket };

      mockS3Client.send.mockResolvedValue({});

      const result = await service.deleteFile(key);

      expect(mockS3Client.send).toHaveBeenCalled();
      expect(result).toEqual({
        message: `File ${key} deleted successfully`,
      });

      // Restore process.env
      process.env = originalEnv;
    });

    it('should handle S3 delete error', async () => {
      const key = 'test-file.pdf';
      const error = new Error('S3 delete error');

      mockS3Client.send.mockRejectedValue(error);

      await expect(service.deleteFile(key)).rejects.toThrow(error);
    });
  });

  describe('sendMessageToQueue', () => {
    it('should send message to SQS queue and update document status', async () => {
      const id = 'doc1';
      const messageBody = {
        documentId: id,
        key: 'test-file.pdf',
        bucket: 'test-bucket',
        mimetype: 'application/pdf',
        size: 1024,
        s3Path: 's3://bucket/test-file.pdf',
      };

      mockSQSClient.send.mockResolvedValue({});

      const result = await service.sendMessageToQueue(id, messageBody);

      expect(mockDocumentService.update).toHaveBeenCalledWith(id, {
        status: DocumentStatus.QUEUED,
      });
      expect(mockSQSClient.send).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('sendPendingDocuementInQueue', () => {
    it('should send specific pending document to queue', async () => {
      mockDocumentService.findById.mockResolvedValue(mockDocument);
      mockSQSClient.send.mockResolvedValue({});

      const result = await service.sendPendingDocuementInQueue('doc1');

      expect(mockDocumentService.findById).toHaveBeenCalledWith('doc1');
      expect(mockSQSClient.send).toHaveBeenCalled();
      expect(result).toBe('1 document(s) sent to queue');
    });

    it('should send all pending documents to queue when no id provided', async () => {
      const pendingDocuments = [mockDocument];
      mockDocumentService.findAll.mockResolvedValue({
        documents: pendingDocuments,
        meta: { totalRecords: 1 },
      });
      mockSQSClient.send.mockResolvedValue({});

      const result = await service.sendPendingDocuementInQueue();

      expect(mockDocumentService.findAll).toHaveBeenCalledWith({
        status: DocumentStatus.PENDING,
        limit: 10,
      });
      expect(mockSQSClient.send).toHaveBeenCalled();
      expect(result).toBe('1 document(s) sent to queue');
    });

    it('should return message when no pending documents found', async () => {
      mockDocumentService.findAll.mockResolvedValue({
        documents: [],
        meta: { totalRecords: 0 },
      });

      const result = await service.sendPendingDocuementInQueue();

      expect(result).toBe('No documents are there to sent in queue ');
    });

    it('should handle document with different status', async () => {
      const processedDocument = { ...mockDocument, status: DocumentStatus.COMPLETED };
      mockDocumentService.findById.mockResolvedValue(processedDocument);

      const result = await service.sendPendingDocuementInQueue('doc1');

      expect(result).toBe('No documents are there to sent in queue ');
    });
  });
});
