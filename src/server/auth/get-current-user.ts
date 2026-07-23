import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authenticateRequest, type AuthUser } from "#/server/auth/session";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthUser | null> => {
		const request = getRequest();
		return authenticateRequest(request);
	},
);
