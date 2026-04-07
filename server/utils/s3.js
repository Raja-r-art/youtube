const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (buffer, mimetype, folder = "uploads") => {
  const ext = mimetype.split("/")[1];
  const key = `${folder}/${uuidv4()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  const cdnBase = process.env.AWS_CLOUDFRONT_URL;
  const url = cdnBase ? `${cdnBase}/${key}` : `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { key, url };
};

const deleteFromS3 = async (key) => {
  await s3.send(
    new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
  );
};

module.exports = { uploadToS3, deleteFromS3 };
