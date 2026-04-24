import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client | null = null;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get('AWS_REGION') || 'us-east-1';
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }

    this.bucketName = this.configService.get('S3_BUCKET_NAME') || 'copilotkit-dashboard-files';
  }

  private checkS3Config() {
    if (!this.s3Client) {
      throw new Error('File uploads require AWS S3 configuration. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.');
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    userId: string,
  ): Promise<string> {
    this.checkS3Config();
    const key = `uploads/${userId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.s3Client!.send(command);

    return key;
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    this.checkS3Config();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client!, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    this.checkS3Config();
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client!.send(command);
  }

  getFileUrl(key: string): string {
    const region = this.configService.get('AWS_REGION') || 'us-east-1';
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
}
