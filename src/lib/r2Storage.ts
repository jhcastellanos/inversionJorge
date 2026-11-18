import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

export function requireR2Config(): R2Config {
  const cfg = getR2Config();
  if (!cfg) {
    throw new Error('R2 no configurado (R2_ACCOUNT_ID, keys, bucket, R2_PUBLIC_BASE_URL)');
  }
  return cfg;
}

function createR2Client(cfg: R2Config) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}

export function publicObjectUrl(key: string, cfg?: R2Config): string {
  const c = cfg ?? requireR2Config();
  const base = c.publicBaseUrl.replace(/\/$/, '');
  const safeKey = key.replace(/^\/+/, '');
  return `${base}/${safeKey}`;
}

export function sanitizeStorageKey(prefix: string, rawPath: string): string | null {
  const trimmed = rawPath.trim().replace(/^\/+/, '');
  if (!trimmed || trimmed.includes('..')) return null;
  if (!/^[a-zA-Z0-9/._-]+$/.test(trimmed)) return null;
  if (!trimmed.startsWith(`${prefix}/`)) {
    return `${prefix}/${trimmed}`;
  }
  return trimmed;
}

export async function putR2Object(key: string, body: Buffer | Uint8Array, contentType: string) {
  const cfg = requireR2Config();
  const client = createR2Client(cfg);
  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return publicObjectUrl(key, cfg);
}

export async function createPresignedPutUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
) {
  const cfg = requireR2Config();
  const client = createR2Client(cfg);
  const command = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return { uploadUrl, fileUrl: publicObjectUrl(key, cfg), key };
}