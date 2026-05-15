import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

class StorageService {
  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET;
  }

  async uploadFile(file, folder = "others") {
    try {
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await this.s3.send(new PutObjectCommand(params));

      // Return the public URL (assuming the bucket is public or use CloudFront)
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error("[STORAGE] Upload error:", error.message);
      throw new Error("Failed to upload file to storage");
    }
  }
}

export const storageService = new StorageService();
