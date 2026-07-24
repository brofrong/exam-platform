export type Role = "admin" | "student";

export type Capability =
	| "program:write"
	| "lesson:write"
	| "invite:create"
	| "submission:review"
	| "analytics:read"
	| "support:reply";

export const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
	admin: [
		"program:write",
		"lesson:write",
		"invite:create",
		"submission:review",
		"analytics:read",
		"support:reply",
	],
	student: [],
};

export function can(role: Role, capability: Capability): boolean {
	return ROLE_CAPABILITIES[role].includes(capability);
}
