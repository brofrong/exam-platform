import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields({
			user: {
				role: {
					type: ["admin", "student"],
					required: false,
					defaultValue: "student",
					input: false,
				},
			},
		}),
	],
});
export const { signIn, signUp, useSession } = authClient;
