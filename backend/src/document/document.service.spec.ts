import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentEnity } from './entities/document.entity';
import { DocumentStatus } from '../common/enums/document-status.enum';
import { FilterDocumentDto } from './dto/filter-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

describe('DocumentService', () => {
  let service: DocumentService;
  let repository: Repository<DocumentEnity>;
  let configService: ConfigService;

  const mockDocument: DocumentEnity = {
    id: '1',
    filename: 'test-document.pdf',
    status: DocumentStatus.PENDING,
    type: 'application/pdf',
    size: 1024,
    s3Path: 's3://bucket/test-document.pdf',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as DocumentEnity;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(DocumentEnity),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    repository = module.get<Repository<DocumentEnity>>(getRepositoryToken(DocumentEnity));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return document when found by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findById('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockDocument);
    });

    it('should return null when document not found by id', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('999');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new document successfully', async () => {
      const fileData = {
        filename: 'new-document.pdf',
        s3Path: 's3://bucket/new-document.pdf',
        mimetype: 'application/pdf',
        size: 2048,
      };

      const newDocument = { ...mockDocument, ...fileData };
      mockRepository.create.mockReturnValue(newDocument);
      mockRepository.save.mockResolvedValue(newDocument);

      const result = await service.create(fileData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        filename: fileData.filename,
        status: DocumentStatus.PENDING,
        type: fileData.mimetype,
        size: fileData.size,
        s3Path: fileData.s3Path,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newDocument);
      expect(result).toEqual(newDocument);
    });
  });

  describe('update', () => {
    it('should update document successfully', async () => {
      const updateDto: UpdateDocumentDto = {
        status: DocumentStatus.COMPLETED,
        message: 'Document updated successfully',
      };

      const updatedDocument = { ...mockDocument, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.save.mockResolvedValue(updatedDocument);

      const result = await service.update('1', updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedDocument);
      expect(result).toEqual(updatedDocument);
    });

    it('should throw NotFoundException when document not found', async () => {
      const updateDto: UpdateDocumentDto = {
        status: DocumentStatus.COMPLETED,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
    });
  });

  describe('findOne', () => {
    it('should return document when found by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findOne('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
    });
  });

  describe('findAll', () => {
    it('should return all documents with default pagination', async () => {
      const documents = [mockDocument];
      const totalRecords = 1;
      const defaultLimit = 10;

      mockConfigService.get.mockReturnValue(defaultLimit);
      mockRepository.findAndCount.mockResolvedValue([documents, totalRecords]);

      const result = await service.findAll();

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [],
        skip: 0,
        take: defaultLimit,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        documents,
        meta: { totalRecords },
      });
    });

    it('should return documents with custom pagination', async () => {
      const documents = [mockDocument];
      const totalRecords = 1;
      const filter: FilterDocumentDto = {
        offset: 5,
        limit: 20,
      };

      mockRepository.findAndCount.mockResolvedValue([documents, totalRecords]);

      const result = await service.findAll(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [],
        skip: 5,
        take: 20,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        documents,
        meta: { totalRecords },
      });
    });

    it('should apply search filter correctly', async () => {
      const documents = [mockDocument];
      const totalRecords = 1;
      const filter: FilterDocumentDto = {
        search: 'test',
      };

      mockConfigService.get.mockReturnValue(10);
      mockRepository.findAndCount.mockResolvedValue([documents, totalRecords]);

      const result = await service.findAll(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [{ filename: Like('%test%') }],
        skip: 0,
        take: 10,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        documents,
        meta: { totalRecords },
      });
    });

    it('should apply status filter correctly', async () => {
      const documents = [mockDocument];
      const totalRecords = 1;
      const filter: FilterDocumentDto = {
        status: DocumentStatus.COMPLETED,
      };

      mockConfigService.get.mockReturnValue(10);
      mockRepository.findAndCount.mockResolvedValue([documents, totalRecords]);

      const result = await service.findAll(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [{ status: DocumentStatus.COMPLETED }],
        skip: 0,
        take: 10,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        documents,
        meta: { totalRecords },
      });
    });

    it('should apply both search and status filters correctly', async () => {
      const documents = [mockDocument];
      const totalRecords = 1;
      const filter: FilterDocumentDto = {
        search: 'test',
        status: DocumentStatus.COMPLETED,
      };

      mockConfigService.get.mockReturnValue(10);
      mockRepository.findAndCount.mockResolvedValue([documents, totalRecords]);

      const result = await service.findAll(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          { filename: Like('%test%') },
          { status: DocumentStatus.COMPLETED },
        ],
        skip: 0,
        take: 10,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        documents,
        meta: { totalRecords },
      });
    });
  });

  describe('remove', () => {
    it('should delete document successfully', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when document not found', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Document not found'));

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(mockRepository.delete).toHaveBeenCalledWith('999');
    });
  });
});
