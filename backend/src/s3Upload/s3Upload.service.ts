import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DocumentService } from 'src/document/document.service';
import { DocumentStatus } from 'src/common/enums/document-status.enum';

interface SqsMessage {
  documentId: string;
  key: string;
  bucket: string;
  mimetype: string;
  size: number;
  s3Path: string;
}

@Injectable()
export class S3UploadService {
  private s3: S3Client;
  private sqs: SQSClient;

  private bucket: string;
  private queueUrl: string;
  constructor(
    private ConfigService: ConfigService,
    private documentService: DocumentService,
  ) {
    const region = this.ConfigService.get<string>('AWS_REGION');
    const accessKeyId = this.ConfigService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.ConfigService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const sqsQueueUrl = this.ConfigService.get<string>('AWS_SQS_QUEUE_URL');

    const bucket = this.ConfigService.get<string>('AWS_S3_BUCKET');

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Missing AWS configuration: region, accessKeyId, or secretAccessKey',
      );
    }
    if (!sqsQueueUrl)
      throw new Error('SQS_QUEUE_URL is not defined in environment variables');

    if (!bucket)
      throw new Error('AWS_S3_BUCKET is not defined in environment variables');

    // S3 Client
    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // SQS Client
    this.sqs = new SQSClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    // SQS Queue URL
    this.queueUrl = sqsQueueUrl;

    // S3 Bucket
    this.bucket = bucket;
  }

  async createMultipartUpload(key: string) {
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3.send(command);
    return response.UploadId!;
  }

  async getPresignedUrl(key: string, uploadId: string, partNumber: number) {
    const command = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: undefined, // client will provide body
    });

    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[],
  ) {
    // 1. Complete upload in S3
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });
    const s3Result = await this.s3.send(command);

    const head = await this.s3.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    // 2. Insert into DB only after success
    const file = await this.documentService.create({
      filename: key,
      mimetype: head.ContentType!,
      size: head.ContentLength!,
      s3Path: s3Result.Location!,
    });

    // 4. Send SQS message for embedding
    const messageBody: SqsMessage = {
      documentId: file.id, // link back to DB record
      key: key,
      bucket: this.bucket,
      mimetype: head.ContentType || '',
      size: head.ContentLength || 0,
      s3Path: s3Result.Location || '',
    };
    this.sendMessageToQueue(file.id, messageBody);
    return { location: s3Result.Location, file, documentId: file.id };
  }

  async sendPendingDocuementInQueue(id?: string) {
    let documents;
    if (id) {
      const document = await this.documentService.findById(id);
      if (document && document.status === DocumentStatus.PENDING) {
        documents = [document];
      }
    } else {
      const result = await this.documentService.findAll({
        status: DocumentStatus.PENDING,
        limit: 10,
      });
      documents = result.documents;
    }
    if (!documents || documents.length === 0) return "No documents are there to sent in queue ";
    for (const document of documents) {
      const messageBody: SqsMessage = {
        documentId: document.id, // link back to DB record
        key: document.s3Path.split('/').pop() || '',
        bucket: this.bucket,
        mimetype: document.type || '',
        size: document.size || 0,
        s3Path: document.s3Path || '',
      };
      await this.sendMessageToQueue(document.id, messageBody);
    }
    return `${documents.length} document(s) sent to queue`;
  }
  async abortMultipartUpload(key: string, uploadId: string) {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
    });

    return this.s3.send(command);
  }

  async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key, // file path in S3
      });

      await this.s3.send(command);

      return { message: `File ${key} deleted successfully` };
    } catch (error) {
      console.error('S3 delete error:', error);
      throw error;
    }
  }

  async sendMessageToQueue(id: string, messageBody: SqsMessage) {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody),
    });
    this.documentService.update(id, {status: DocumentStatus.QUEUED});
    return this.sqs.send(command);
  }
  catch(error) {
    // TODO : handle logging
    console.error('SQS send message error:', error);
  }
}
