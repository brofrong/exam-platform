import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "#/server/db/db";
import { usersTable } from "#/server/db/user/user.schema";
import { env } from "#/utils/env";

export const SESSION_COOKIE = "session";

const SESSION_SECRET = env.SESSION_SECRET;

export type AuthUser = {
	id: string;
	login: string;
};

export type ZeroContext = AuthUser;

declare module "@rocicorp/zero" {
	interface DefaultTypes {
		context: ZeroContext;
	}
}

function signPayload(payload: string): string {
	return createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

export function createSessionToken(userId: string): string {
	return `${userId}.${signPayload(userId)}`;
}

export function verifySessionToken(token: string): string | null {
	const dotIndex = token.indexOf(".");
	if (dotIndex === -1) {
		return null;
	}

	const userId = token.slice(0, dotIndex);
	const signature = token.slice(dotIndex + 1);
	if (!userId || !signature) {
		return null;
	}

	const expected = signPayload(userId);
	try {
		if (
			!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
		) {
			return null;
		}
		return userId;
	} catch {
		return null;
	}
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
	if (!cookieHeader) {
		return {};
	}

	return cookieHeader.split(";").reduce<Record<string, string>>((cookies, part) => {
		const [name, ...rest] = part.trim().split("=");
		if (!name) {
			return cookies;
		}
		cookies[name] = decodeURIComponent(rest.join("="));
		return cookies;
	}, {});
}

export function getSessionTokenFromRequest(request: Request): string | null {
	const cookies = parseCookieHeader(request.headers.get("Cookie"));
	return cookies[SESSION_COOKIE] ?? null;
}

export function createSessionCookie(token: string): string {
	const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
	return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure}`;
}

export function clearSessionCookie(): string {
	const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
	return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function authenticateRequest(
	request: Request,
): Promise<AuthUser | null> {
	const token = getSessionTokenFromRequest(request);
	if (!token) {
		return null;
	}

	const userId = verifySessionToken(token);
	if (!userId) {
		return null;
	}

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);

	if (!user) {
		return null;
	}

	return { id: user.id, login: user.login };
}
