import { defineRelations } from "drizzle-orm";
import { usersTable } from "#/server/db/user/user.schema";

const DrizzleSchema = {
	user: usersTable,
};

export const relations = defineRelations(DrizzleSchema, (_r) => ({
	user: {},
}));
