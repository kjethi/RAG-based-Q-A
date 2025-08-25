import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { QaController } from './qa.controller';
import { QaService } from './qa.service';
import { AskQuestionDto } from './dto/ask-question.dto';

describe('QaController', () => {
  let controller: QaController;
  let qaService: QaService;

  const mockQaService = {
    askQuestion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QaController],
      providers: [
        {
          provide: QaService,
          useValue: mockQaService,
        },
      ],
    }).compile();

    controller = module.get<QaController>(QaController);
    qaService = module.get<QaService>(QaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('askQuestion', () => {
    it('should return answer successfully', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
        maxContextResults: 5,
        fileIds: ['doc1', 'doc2'],
      };

      const expectedResponse = {
        answer: 'This is a test answer',
        sources: [
          {
            id: 'source_0',
            documentId: 'doc1',
            title: 'Test Document 1',
            snippet: 'This is the content from document 1',
            score: 0.1,
          },
        ],
      };

      mockQaService.askQuestion.mockResolvedValue(expectedResponse);

      const result = await controller.askQuestion(askQuestionDto);

      expect(qaService.askQuestion).toHaveBeenCalledWith(askQuestionDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle question with minimal parameters', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const expectedResponse = {
        answer: 'This is a test answer',
        sources: [],
      };

      mockQaService.askQuestion.mockResolvedValue(expectedResponse);

      const result = await controller.askQuestion(askQuestionDto);

      expect(qaService.askQuestion).toHaveBeenCalledWith(askQuestionDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle question with custom context results', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
        maxContextResults: 10,
      };

      const expectedResponse = {
        answer: 'This is a test answer',
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
      };

      mockQaService.askQuestion.mockResolvedValue(expectedResponse);

      const result = await controller.askQuestion(askQuestionDto);

      expect(qaService.askQuestion).toHaveBeenCalledWith(askQuestionDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle question with specific file IDs', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
        fileIds: ['specific-doc-1', 'specific-doc-2'],
      };

      const expectedResponse = {
        answer: 'This is a test answer',
        sources: [
          {
            id: 'source_0',
            documentId: 'specific-doc-1',
            title: 'Specific Document 1',
            snippet: 'This is the content from specific document 1',
            score: 0.1,
          },
        ],
      };

      mockQaService.askQuestion.mockResolvedValue(expectedResponse);

      const result = await controller.askQuestion(askQuestionDto);

      expect(qaService.askQuestion).toHaveBeenCalledWith(askQuestionDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw HttpException when service throws error with message', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const serviceError = new Error('RAG backend error: Service unavailable');
      mockQaService.askQuestion.mockRejectedValue(serviceError);

      await expect(controller.askQuestion(askQuestionDto)).rejects.toThrow(
        new HttpException(
          'RAG backend error: Service unavailable',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(qaService.askQuestion).toHaveBeenCalledWith(askQuestionDto);
    });

    it('should throw HttpException with default message when service throws error without message', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const serviceError = new Error();
      mockQaService.askQuestion.mockRejectedValue(serviceError);

      await expect(controller.askQuestion(askQuestionDto)).rejects.toThrow(
        new HttpException(
          'Failed to get answer',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(qaService.askQuestion).toHaveBeenCalledWith(askQuestionDto);
    });

    it('should throw HttpException when service throws HttpException', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What is this about?',
      };

      const httpException = new HttpException(
        'Bad request error',
        HttpStatus.BAD_REQUEST,
      );
      mockQaService.askQuestion.mockRejectedValue(httpException);

      await expect(controller.askQuestion(askQuestionDto)).rejects.toThrow(
        new HttpException(
          'Bad request error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(qaService.askQuestion).toHaveBeenCalledWith(askQuestionDto);
    });

    it('should handle complex question with all parameters', async () => {
      const askQuestionDto: AskQuestionDto = {
        question: 'What are the main features and benefits of this system?',
        maxContextResults: 15,
        fileIds: ['feature-doc', 'benefit-doc', 'overview-doc'],
      };

      const expectedResponse = {
        answer: 'This system provides comprehensive features including document processing, AI-powered Q&A, and secure file management. The main benefits are improved efficiency, accuracy, and user experience.',
        sources: [
          {
            id: 'source_0',
            documentId: 'feature-doc',
            title: 'Features Documentation',
            snippet: 'The system includes document processing, AI-powered Q&A, and secure file management capabilities.',
            score: 0.05,
          },
          {
            id: 'source_1',
            documentId: 'benefit-doc',
            title: 'Benefits Overview',
            snippet: 'Users experience improved efficiency, accuracy, and overall user experience.',
            score: 0.08,
          },
        ],
      };

      mockQaService.askQuestion.mockResolvedValue(expectedResponse);

      const result = await controller.askQuestion(askQuestionDto);

      expect(qaService.askQuestion).toHaveBeenCalledWith(askQuestionDto);
      expect(result).toEqual(expectedResponse);
      expect(result.answer).toContain('features');
      expect(result.answer).toContain('benefits');
      expect(result.sources).toHaveLength(2);
    });
  });
});
