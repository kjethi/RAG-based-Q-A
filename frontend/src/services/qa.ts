import { AxiosError } from "axios";
import { apiPost } from "./api";

export interface Source {
  id: string;
  title: string;
  snippet: string;
  score: number; // 0..1 relevance score
}

export interface QAResponse {
  answer: string;
  confidence: number; // 0..1
  sources: Source[];
}

export const qaService = {
  async askQuestion(question: string): Promise<QAResponse> {
    try {
      const response = await apiPost<{data: QAResponse}>("/qa/ask", { question });
      return response.data.data;
    } catch (error) {
      let errorDetail = "Failed to get answer";
      if (error instanceof AxiosError) {
        errorDetail = error.response?.data?.message || error.response?.data?.error || errorDetail;
      }
      return Promise.reject(errorDetail);
    }
  },

  // For now, return a mock response until the backend RAG endpoint is ready
  async askQuestionMock(question: string): Promise<QAResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      answer: `This is a mock response to: "${question}". The actual RAG backend endpoint needs to be implemented.`,
      confidence: 0.7,
      sources: [
        {
          id: "mock1",
          title: "Example Document.pdf",
          snippet: "This is a mock source document that would contain relevant information...",
          score: 0.8,
        },
      ],
    };
  },
};
