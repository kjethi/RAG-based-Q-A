import { Controller, Post, Body, UseGuards, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { QaService } from './qa.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AskQuestionDto } from './dto/ask-question.dto';
import { QAResponseDto } from './dto/qa-response.dto';

@ApiTags('Question Answering')
@Controller('qa')
@UseGuards(JwtAuthGuard)
export class QaController {
  constructor(private readonly qaService: QaService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Ask a question and get RAG-based answer' })
  @ApiBody({ type: AskQuestionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Answer generated successfully',
    type: QAResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(HttpStatus.OK)
  async askQuestion(@Body() askQuestionDto: AskQuestionDto): Promise<QAResponseDto> {
    try {
      const result = await this.qaService.askQuestion(askQuestionDto);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get answer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
