import type { Role } from "#/shared/authz";

export type AuthUser = {
	id: string;
	name: string;
	email: string;
	role: Role;
};

export type ZeroContext = {
	id: string;
	name: string;
	role: Role;
};

declare module "@rocicorp/zero" {
	interface DefaultTypes {
		context: ZeroContext;
	}
}
