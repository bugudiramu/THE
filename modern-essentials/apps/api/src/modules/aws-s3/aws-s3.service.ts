import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    this.logger.log(
      `Uploading file: ${file.originalname} to folder: ${folder}`,
    );

    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const publicUrl = `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET}/${key}`;
      this.logger.log(`File uploaded successfully: ${publicUrl}`);

      return publicUrl;
    } catch (error: any) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error("Failed to upload file");
    }
  }

  async deleteFile(key: string): Promise<void> {
    this.logger.log(`Deleting file: ${key}`);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
          Key: key,
        }),
      );

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error("Failed to delete file");
    }
  }
}
