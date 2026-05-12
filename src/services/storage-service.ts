import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as path from 'path';

export class StorageService {
  private s3Client: S3Client | null = null;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'planmaestro-pdfs';
    
    // Initialize S3 client only if credentials exist
    if (process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        // Force path style for MinIO compatibility
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
      });
      console.log('✅ StorageService: Initialized S3 Client for endpoint', process.env.S3_ENDPOINT);
    } else {
      console.log('⚠️ StorageService: S3 credentials not found, falling back to local storage only.');
    }
  }

  /**
   * Uploads a buffer to S3 and returns a pre-signed URL valid for 24 hours.
   */
  async uploadPDF(pdfBuffer: Buffer, filename: string): Promise<string | null> {
    if (!this.s3Client) {
      return null;
    }

    try {
      const key = `generated-pdfs/${filename}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ContentDisposition: `inline; filename="${filename}"`
      });

      await this.s3Client.send(command);

      // Generate a pre-signed URL valid for 24 hours
      const getCommand = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 86400 });
      return signedUrl;

    } catch (error) {
      console.error('❌ StorageService: Error uploading PDF to S3', error);
      return null;
    }
  }
}

export const storageService = new StorageService();
