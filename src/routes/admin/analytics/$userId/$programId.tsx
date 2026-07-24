import { createFileRoute, redirect } from "@tanstack/react-router";
import { AnalyticsDetailPage } from "#/features/analytics";
import { can } from "#/shared/authz";

export const Route = createFileRoute("/admin/analytics/$userId/$programId")({
	beforeLoad: ({ context }) => {
		if (!can(context.user.role, "analytics:read")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminAnalyticsDetailRoute,
});

function AdminAnalyticsDetailRoute() {
	const { userId, programId } = Route.useParams();
	return <AnalyticsDetailPage userId={userId} programId={programId} />;
}
