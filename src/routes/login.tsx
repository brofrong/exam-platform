import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { LoginForm } from "#/features/auth";
import { getCurrentUser } from "#/server/auth/get-current-user";

const loginSearchSchema = z.object({
	returnUrl: z.string().optional(),
});

function safeReturnUrl(value: string | undefined): string {
	if (!value || !value.startsWith("/") || value.startsWith("//")) {
		return "/app";
	}
	return value;
}

export const Route = createFileRoute("/login")({
	validateSearch: loginSearchSchema,
	beforeLoad: async ({ search }) => {
		const user = await getCurrentUser();
		if (user) {
			throw redirect({ href: safeReturnUrl(search.returnUrl) });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const { returnUrl } = Route.useSearch();
	return <LoginForm returnUrl={safeReturnUrl(returnUrl)} />;
}
