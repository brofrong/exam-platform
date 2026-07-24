import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	server: {
		APP_URL: z.string().default("http://localhost:3000"),
		ZERO_UPSTREAM_DB: z.string(),
		ZERO_CACHE_UPSTREAM_URL: z.string().default("http://localhost:4848"),
		/** Prefer explicit secret in prod / multi-instance. DB bootstrap is the fallback. */
		BETTER_AUTH_SECRET: z.string().min(32).optional(),
		/** S3-compatible endpoint (MinIO in local docker). */
		S3_ENDPOINT: z.string().url().default("http://localhost:9000"),
		S3_ACCESS_KEY: z.string().min(1).default("minioadmin"),
		S3_SECRET_KEY: z.string().min(1).default("minioadmin"),
		S3_BUCKET_UPLOADS: z.string().min(1).default("exam-platform-uploads"),
		S3_REGION: z.string().min(1).default("us-east-1"),
	},
	client: {},
	runtimeEnv: {
		...process.env,
		...import.meta.env,
	},
	emptyStringAsUndefined: true,
});
