"use server";

/**
 * Server Action to generate a Presigned URL for uploading files directly to Cloudflare R2.
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MAX_FILE_SIZE } from "@/models/constant/upload";
import { dbLog } from "@/services/loggerService";

const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export const getPresignedUrl = async (fileName: string, contentType: string, fileSize: number) => {
    try {
        if (!process.env.R2_BUCKET_NAME) {
            throw new Error("R2_BUCKET_NAME is not defined");
        }

        if (fileSize > MAX_FILE_SIZE) {
            return { success: false, error: "File size exceeds limit" };
        }

        const uniqueFileName = `${crypto.randomUUID()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: uniqueFileName,
            ContentType: contentType,
            ContentLength: fileSize,
        });

        const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

        // Return the upload URL and the public URL where the file will be accessible
        const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${uniqueFileName}`;

        return { success: true, url: signedUrl, publicUrl, fileName: uniqueFileName };
    } catch (error) {
        dbLog({ description: `Error generating presigned URL: ${error instanceof Error ? error.message : String(error)}` });
        return { success: false, error: "Failed to generate upload URL" };
    }
};
