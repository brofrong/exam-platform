export type Role = "admin" | "teacher" | "student";

export type Capability =
	| "program:write"
	| "lesson:write"
	| "invite:create"
	| "submission:review"
	| "analytics:read"
	| "support:reply"
	| "users:manage"
	| "settings:ai";

const STAFF_CAPABILITIES = [
	"program:write",
	"lesson:write",
	"invite:create",
	"submission:review",
	"analytics:read",
	"support:reply",
] as const satisfies readonly Capability[];

export const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
	admin: [...STAFF_CAPABILITIES, "users:manage", "settings:ai"],
	teacher: [...STAFF_CAPABILITIES],
	student: [],
};

export const ROLES: readonly Role[] = ["admin", "teacher", "student"];

export function isRole(value: unknown): value is Role {
	return value === "admin" || value === "teacher" || value === "student";
}

export function toRole(value: unknown): Role {
	return isRole(value) ? value : "student";
}

export function can(role: Role, capability: Capability): boolean {
	return ROLE_CAPABILITIES[role].includes(capability);
}

export function roleLabel(role: Role): string {
	switch (role) {
		case "admin":
			return "Админ";
		case "teacher":
			return "Преподаватель";
		case "student":
			return "Ученик";
	}
}
