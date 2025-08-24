import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AskQuestionDto } from './dto/ask-question.dto';

@Injectable()
export class QaService {
  private readonly ragBackendUrl: string;

  constructor(private configService: ConfigService) {
    this.ragBackendUrl =
      this.configService.get<string>('RAG_BACKEND_URL') ||
      'http://localhost:8000';
  }

  async askQuestion(askQuestionDto: AskQuestionDto) {
    try {
      const response = await axios.post(
        `${this.ragBackendUrl}/ask`,
        {
          question: askQuestionDto.question,
          max_context_results: askQuestionDto.maxContextResults || 5,
          file_id: askQuestionDto.fileIds || [],
        }
      );

      const maxDistance = response.data.context_used.map(ele=>ele.distance)
      
      // Transform the response to match our frontend expectations
      return {
        answer: response.data.answer,
        sources: response.data.context_used.map(
          (context: any, index: number) => ({
            id: `source_${index}`,
            documentId: context.metadata.documentId,
            title: context.metadata?.source || `Source ${index + 1}`,
            snippet:
              context.document || context.content || 'No content available',
            score: context.distance, // The RAG backend doesn't provide relevance scores, so we'll use a default
          }),
        ),
      };
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          `RAG backend error: ${error.response.data?.detail || error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Failed to communicate with RAG backend',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
