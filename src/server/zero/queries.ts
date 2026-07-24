import { defineQueries, defineQuery } from "@rocicorp/zero";
import { zql } from "./schema";

/**
 * Domain queries — `me` keeps the registry non-empty for TypeScript until LMS
 * queries land. Safe: scoped to the signed-in user only.
 */
export const queries = defineQueries({
	me: defineQuery(({ ctx }) => {
		if (!ctx?.id) {
			throw new Error("Unauthorized");
		}
		return zql.user.where("id", ctx.id).one();
	}),
});
