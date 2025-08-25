export type DocumentStatus = "pending" | "queued" | "completed" | 'processing' | 'failed';

export interface Doc {
  id: string;
  filename: string;
  s3Path: string;
  type: string;
  size: number;
  status: DocumentStatus;
  message: boolean;
  createdAt: Date;
  updatedAt: Date;
}
