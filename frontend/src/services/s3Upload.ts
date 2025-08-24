import { AxiosError } from "axios";
import { apiPost, apiDelete } from "./api";

export interface InitUploadResponse {
  uploadId: string;
}

export interface PresignResponse {
  url: string;
}

export interface CompleteUploadResponse {
  message: string;
  documentId?: string;
}

export interface UploadPart {
  ETag: string;
  PartNumber: number;
}

export const s3UploadService = {
  async initUpload(filename: string): Promise<InitUploadResponse> {
    try {
      const response = await apiPost("/s3-upload/init", { filename });
      const data = response.data as {data : InitUploadResponse}
      return data.data;
    } catch (error) {
      let errorDetail = "Failed to initialize upload";
      if (error instanceof AxiosError) {
        errorDetail = error.response?.data?.message || error.response?.data?.error || errorDetail;
      }
      return Promise.reject(errorDetail);
    }
  },

  async getPresignedUrl(filename: string, uploadId: string, partNumber: number): Promise<PresignResponse> {
    try {
      const response = await apiPost("/s3-upload/presign", {
        filename,
        uploadId,
        partNumber,
      });
      const data = response.data as {data : PresignResponse}
      return data.data;
    } catch (error) {
      let errorDetail = "Failed to get presigned URL";
      if (error instanceof AxiosError) {
        errorDetail = error.response?.data?.message || error.response?.data?.error || errorDetail;
      }
      return Promise.reject(errorDetail);
    }
  },

  async completeUpload(filename: string, uploadId: string, parts: UploadPart[]): Promise<CompleteUploadResponse> {
    try {
      const response = await apiPost("/s3-upload/complete", {
        filename,
        uploadId,
        parts,
      });
      return response.data;
    } catch (error) {
      let errorDetail = "Failed to complete upload";
      if (error instanceof AxiosError) {
        errorDetail = error.response?.data?.message || error.response?.data?.error || errorDetail;
      }
      return Promise.reject(errorDetail);
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      await apiDelete(`/s3-upload/${id}`);
    } catch (error) {
      let errorDetail = "Failed to delete document";
      if (error instanceof AxiosError) {
        errorDetail = error.response?.data?.message || error.response?.data?.error || errorDetail;
      }
      return Promise.reject(errorDetail);
    }
  },

  async sendPendingDocumentToSqs(id?: string): Promise<any> {
    try {
      const response = await apiPost("/s3-upload/send-sqs-pending", { id });
      return response.data;
    } catch (error) {
      let errorDetail = "Failed to send document to processing queue";
      if (error instanceof AxiosError) {
        errorDetail = error.response?.data?.message || error.response?.data?.error || errorDetail;
      }
      return Promise.reject(errorDetail);
    }
  },
};
