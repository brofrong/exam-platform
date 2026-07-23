import { auth } from "#/server/auth/auth";
import type { AuthUser } from "#/server/auth/types";

export async function authenticateRequest(
	request: Request,
): Promise<AuthUser | null> {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return null;
	}

	return {
		id: session.user.id,
		name: session.user.name,
		email: session.user.email,
	};
}
