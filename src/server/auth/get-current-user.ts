import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import type { AuthUser } from "#/server/auth/types";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthUser | null> => {
		const request = getRequest();
		return authenticateRequest(request);
	},
);
