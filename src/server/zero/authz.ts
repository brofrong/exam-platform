import type { ZeroContext } from "#/server/auth/types";
import { type Capability, can } from "#/shared/authz";

export function requireUser(ctx: ZeroContext | undefined): ZeroContext {
	if (!ctx?.id) {
		throw new Error("Unauthorized");
	}
	return ctx;
}

export function requireCapability(
	ctx: ZeroContext | undefined,
	capability: Capability,
): ZeroContext {
	const user = requireUser(ctx);
	if (!can(user.role, capability)) {
		throw new Error("Forbidden");
	}
	return user;
}
