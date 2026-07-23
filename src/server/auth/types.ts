export type AuthUser = {
	id: string;
	name: string;
	email: string;
};

export type ZeroContext = {
	id: string;
	name: string;
};

declare module "@rocicorp/zero" {
	interface DefaultTypes {
		context: ZeroContext;
	}
}
