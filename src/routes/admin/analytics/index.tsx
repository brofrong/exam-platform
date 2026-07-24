import { createFileRoute, redirect } from "@tanstack/react-router";
import { AnalyticsListPage } from "#/features/analytics";
import { can } from "#/shared/authz";

export const Route = createFileRoute("/admin/analytics/")({
	beforeLoad: ({ context }) => {
		if (!can(context.user.role, "analytics:read")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminAnalyticsIndexPage,
});

function AdminAnalyticsIndexPage() {
	return <AnalyticsListPage />;
}
