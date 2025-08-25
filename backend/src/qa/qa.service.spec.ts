import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { QaService } from './qa.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('QaService', () => {
  let service: QaService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockRagResponse = {
    answer: 'This is a test answer',
    context_used: [
      {
        distance: 0.1,
        metadata: {
          documentId: 'doc1',
          source: 'Test Document 1',
        },
        document: 'This is the content from document 1',
      },
      {
        distance: 0.2,
        metadata: {
          documentId: 'doc2',
          source: 'Test Document 2',
        },
        content: 'This is the content from document 2',
      },
    ],
  };

  beforeEach(async () => {
    // Reset mock before each test
    mockConfigService.get.mockReturnValue('http://localhost:8000');
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QaService>(QaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set default RAG backend URL when config is not provided', () => {
      mockConfigService.get.mockReturnValue(undefined);
      
      const newService = new QaService(configService);
      
      expect(mockConfigService.get).toHaveBeenCalledWith('RAG_BACKEND_URL');
    });

    it('should set RAG backend URL from config', () => {
      const customUrl = 'http://custom-rag-backend:8000';
      mockConfigService.get.mockReturnValue(customUrl);
      
      const newService = new QaService(configService);
      
      expect(mockConfigService.get).toHaveBeenCalledWith('RAG_BACKEND_URL');
    });
  });

  describe('askQuestion', () => {
    it('should successfully ask a question and return formatted response', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
        maxContextResults: 5,
        fileIds: ['doc1', 'doc2'],
      };

      const expectedUrl = 'http://localhost:8000/ask';
      mockConfigService.get.mockReturnValue('http://localhost:8000');
      mockedAxios.post.mockResolvedValue({
        data: mockRagResponse,
      });

      const result = await service.askQuestion(askQuestionDto);

      expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, {
        question: askQuestionDto.question,
        max_context_results: askQuestionDto.maxContextResults,
        file_id: askQuestionDto.fileIds,
      });

      expect(result).toEqual({
        answer: mockRagResponse.answer,
        sources: [
          {
            id: 'source_0',
            documentId: 'doc1',
            title: 'Test Document 1',
            snippet: 'This is the content from document 1',
            score: 0.1,
          },
          {
            id: 'source_1',
            documentId: 'doc2',
            title: 'Test Document 2',
            snippet: 'This is the content from document 2',
            score: 0.2,
          },
        ],
      });
    });

    it('should use default values when optional parameters are not provided', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const expectedUrl = 'http://localhost:8000/ask';
      mockConfigService.get.mockReturnValue('http://localhost:8000');
      mockedAxios.post.mockResolvedValue({
        data: mockRagResponse,
      });

      const result = await service.askQuestion(askQuestionDto);

      expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, {
        question: askQuestionDto.question,
        max_context_results: 5,
        file_id: [],
      });

      expect(result.answer).toBe(mockRagResponse.answer);
      expect(result.sources).toHaveLength(2);
    });

    it('should handle response with missing content field gracefully', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const responseWithMissingContent = {
        answer: 'This is a test answer',
        context_used: [
          {
            distance: 0.1,
            metadata: {
              documentId: 'doc1',
              source: 'Test Document 1',
            },
            // Missing document/content field
          },
        ],
      };

      mockConfigService.get.mockReturnValue('http://localhost:8000');
      mockedAxios.post.mockResolvedValue({
        data: responseWithMissingContent,
      });

      const result = await service.askQuestion(askQuestionDto);

      expect(result.sources[0].snippet).toBe('No content available');
    });

    it('should handle response with document field', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const responseWithDocumentField = {
        answer: 'This is a test answer',
        context_used: [
          {
            distance: 0.1,
            metadata: {
              documentId: 'doc1',
              source: 'Test Document 1',
            },
            document: 'This is the document content',
          },
        ],
      };

      mockConfigService.get.mockReturnValue('http://localhost:8000');
      mockedAxios.post.mockResolvedValue({
        data: responseWithDocumentField,
      });

      const result = await service.askQuestion(askQuestionDto);

      expect(result.sources[0].snippet).toBe('This is the document content');
    });

    it('should handle response with content field', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const responseWithContentField = {
        answer: 'This is a test answer',
        context_used: [
          {
            distance: 0.1,
            metadata: {
              documentId: 'doc1',
              source: 'Test Document 1',
            },
            content: 'This is the content field',
          },
        ],
      };

      mockConfigService.get.mockReturnValue('http://localhost:8000');
      mockedAxios.post.mockResolvedValue({
        data: responseWithContentField,
      });

      const result = await service.askQuestion(askQuestionDto);

      expect(result.sources[0].snippet).toBe('This is the content field');
    });

    it('should throw HttpException when RAG backend returns an error response', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const errorResponse = {
        response: {
          data: {
            detail: 'RAG backend error message',
          },
        },
      };

      mockConfigService.get.mockReturnValue('http://localhost:8000');
      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(service.askQuestion(askQuestionDto)).rejects.toThrow(
        new HttpException(
          'RAG backend error: RAG backend error message',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw HttpException when RAG backend is unreachable', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const networkError = new Error('Network error');

      mockConfigService.get.mockReturnValue('http://localhost:8000');
      mockedAxios.post.mockRejectedValue(networkError);

      await expect(service.askQuestion(askQuestionDto)).rejects.toThrow(
        new HttpException(
          'Failed to communicate with RAG backend',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should handle error response without detail field', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const errorResponse = {
        response: {
          data: {},
        },
      };

      mockConfigService.get.mockReturnValue('http://localhost:8000');
      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(service.askQuestion(askQuestionDto)).rejects.toThrow(
        new HttpException(
          'RAG backend error: undefined',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle error response with message field', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const errorResponse = {
        response: {
          data: {},
        },
        message: 'Custom error message',
      };

      mockConfigService.get.mockReturnValue('http://localhost:8000');
      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(service.askQuestion(askQuestionDto)).rejects.toThrow(
        new HttpException(
          'RAG backend error: Custom error message',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
