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
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DocumentService } from 'src/document/document.service';

@Injectable()
export class S3UploadService {
  private s3: S3Client;
  private bucket: string;
  constructor(
    private ConfigService: ConfigService,
    private documentService: DocumentService,
  ) {
    const region = this.ConfigService.get<string>('AWS_REGION');
    const accessKeyId = this.ConfigService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.ConfigService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucket = this.ConfigService.get<string>('AWS_S3_BUCKET');

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Missing AWS configuration: region, accessKeyId, or secretAccessKey',
      );
    }
    if (!bucket)
      throw new Error('AWS_S3_BUCKET is not defined in environment variables');

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucket = bucket;
  }

  async createMultipartUpload(key: string) {
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3.send(command);
    return response.UploadId;
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
    const file = this.documentService.create({
      filename: key,
      mimetype: head.ContentType!,
      size: head.ContentLength!,
      s3Path : s3Result.Location!
    });

    return { location: s3Result.Location, file };
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
}
