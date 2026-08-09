import {
	inferAdditionalFields,
	usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		usernameClient(),
		inferAdditionalFields({
			user: {
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
		}),
	],
});
export const { signIn, signUp, useSession } = authClient;
