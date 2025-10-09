import { PutObjectCommand } from "@aws-sdk/client-s3";
import { logger } from "../utils";
import { v4 as uuidu4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../utils/s3Client";
import axios from "axios";
import { Readable } from "stream";

//for getting multiple presigned urls
export const getPresignedUrls = async (files: Express.Multer.File[]) => {
  try {
    const urls = await Promise.all(
      files.map(async (file) => {
        if (!file.originalname || !file.mimetype || !file.size) {
          logger.error("File data is required!");
          return null;
        }

        const uniqueKey = `${uuidu4()}-${file.originalname}`;

        const command = new PutObjectCommand({
          Key: uniqueKey,
          ContentLength: file.size,
          ContentType: file.mimetype,
          Bucket: process.env.S3_BUCKET_NAME!,
        });

        logger.info(`Generating ${uniqueKey} presignedUrls...`);
        const presignedUrl = await getSignedUrl(s3, command, {
          expiresIn: 3600,
        });

        const permanentUrl = `https://${process.env.S3_BUCKET_NAME}.t3.storage.dev/${uniqueKey}`;

        const fileBuffer = file.buffer;
        await axios.put(presignedUrl, fileBuffer, {
          headers: {
            "Content-Type": file.mimetype,
            "Content-Length": file.size,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });

        logger.info(`Upload complete for ${uniqueKey}`);
        logger.info(`File uploaded permanently: ${permanentUrl}`);

        logger.info(`Presigned Url generated: ${presignedUrl}`);

        return permanentUrl;
      })
    );

    return urls.filter(Boolean) as string[];
  } catch (error) {
    logger.error(error);
    return [];
  }
};

//for getting single presigned urls
export const getPresignedUrl = async (file: Express.Multer.File) => {
  try {
    if (!file.originalname || !file.mimetype || !file.size) {
      logger.error("File data is required!");
      return null;
    }

    const uniqueKey = `${uuidu4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Key: uniqueKey,
      ContentLength: file.size,
      ContentType: file.mimetype,
      Bucket: process.env.S3_BUCKET_NAME!,
    });

    logger.info("Generating presignedUrl...");
    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });
    logger.info(`Presigned Url generated: ${presignedUrl}`);

    const permanentUrl = `https://${process.env.S3_BUCKET_NAME}.t3.storage.dev/${uniqueKey}`;
    logger.info(`File uploaded permanently: ${permanentUrl}`);

    const fileBuffer = file.buffer;

    await axios.put(presignedUrl, fileBuffer, {
      headers: {
        "Content-Type": file.mimetype,
      },
    });
    return permanentUrl;
  } catch (error) {
    logger.error(error);
    return [];
  }
};

/*const stream = Readable.from(file.buffer);
        let uploadedBytes = 0;

        stream.on("data", (chunk) => {
          uploadedBytes += chunk.length;
          const percent = ((uploadedBytes / file.size) * 100).toFixed(2);
          logger.info(`Uploading ${uniqueKey}: ${percent}%`);
        });*/
