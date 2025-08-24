import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxContextResults?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileIds?: string[];
}
