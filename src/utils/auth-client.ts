import { createAuthClient } from "better-auth/react";
import { env } from "./env";

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: env.VITE_BETTER_AUTH_URL,
});
export const { signIn, signUp, useSession } = authClient;
