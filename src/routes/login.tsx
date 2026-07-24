import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "#/features/auth";
import { getCurrentUser } from "#/server/auth/get-current-user";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const user = await getCurrentUser();
		if (user) {
			throw redirect({ to: "/app" });
		}
	},
	component: LoginForm,
});
