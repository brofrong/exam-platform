import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { account, session, verification } from "#/server/db/auth/auth.schema";
import { betterAuthSecret, db } from "#/server/db/db";
import { usersTable } from "#/server/db/user/user.schema";
import { env } from "#/shared/env";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: usersTable,
			session,
			account,
			verification,
		},
	}),
	secret: betterAuthSecret,
	baseURL: env.APP_URL,
	emailAndPassword: {
		enabled: true,
	},
	user: {
		changeEmail: {
			enabled: true,
			updateEmailWithoutVerification: true,
		},
		additionalFields: {
			role: {
				type: ["admin", "teacher", "student"],
				required: false,
				defaultValue: "student",
				input: false,
			},
			notifySupportReply: {
				type: "boolean",
				required: false,
				defaultValue: true,
				input: true,
			},
			notifyReviewGraded: {
				type: "boolean",
				required: false,
				defaultValue: true,
				input: true,
			},
		},
	},
	plugins: [username(), tanstackStartCookies()],
});
