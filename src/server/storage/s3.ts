import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "#/shared/env";

let client: S3Client | undefined;

function getClient(): S3Client {
	if (!client) {
		client = new S3Client({
			endpoint: env.S3_ENDPOINT,
			region: env.S3_REGION,
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY,
				secretAccessKey: env.S3_SECRET_KEY,
			},
			forcePathStyle: true,
		});
	}
	return client;
}

function resolveBucket(bucket?: string): string {
	return bucket ?? env.S3_BUCKET_UPLOADS;
}

export type PutObjectInput = {
	key: string;
	body: string | Uint8Array | Buffer;
	contentType?: string;
	bucket?: string;
};

export type ObjectRef = {
	bucket: string;
	key: string;
};

/** Upload an object to the uploads bucket (or an override). */
export async function putObject(input: PutObjectInput): Promise<ObjectRef> {
	const bucket = resolveBucket(input.bucket);
	await getClient().send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: input.key,
			Body: input.body,
			ContentType: input.contentType,
		}),
	);
	return { bucket, key: input.key };
}

export type GetSignedGetUrlInput = {
	key: string;
	expiresIn?: number;
	bucket?: string;
};

/** Presigned GET URL for temporary download access. */
export async function getSignedGetUrl(
	input: GetSignedGetUrlInput,
): Promise<string> {
	const bucket = resolveBucket(input.bucket);
	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: input.key,
	});
	return getSignedUrl(getClient(), command, {
		expiresIn: input.expiresIn ?? 60 * 15,
	});
}

export type DeleteObjectInput = {
	key: string;
	bucket?: string;
};

/** Delete an object by key. */
export async function deleteObject(input: DeleteObjectInput): Promise<void> {
	const bucket = resolveBucket(input.bucket);
	await getClient().send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: input.key,
		}),
	);
}
