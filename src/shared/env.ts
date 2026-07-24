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
	},
	client: {},
	runtimeEnv: {
		...process.env,
		...import.meta.env,
	},
	emptyStringAsUndefined: true,
});
