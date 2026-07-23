import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	server: {
		ZERO_UPSTREAM_DB: z.string(),
		ZERO_CACHE_UPSTREAM_URL: z.string().default("http://localhost:4848"),
	},
	client: {
		VITE_BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
		VITE_ZERO_CACHE_URL: z.string().default("http://localhost:4848"),
	},
	runtimeEnv: {
		...process.env,
		...import.meta.env,
	},
	emptyStringAsUndefined: true,
});
