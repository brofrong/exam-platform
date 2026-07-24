import type { AuthUser } from "#/server/auth/types";

export type ChatUser = Pick<AuthUser, "id" | "name" | "email">;
