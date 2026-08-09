import { createFileRoute, redirect } from "@tanstack/react-router";
import { PlatformSettingsPage } from "#/features/admin-settings";
import { can } from "#/shared/authz";

export const Route = createFileRoute("/admin/settings/")({
	beforeLoad: ({ context }) => {
		if (!can(context.user.role, "settings:ai")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminPlatformSettingsRoute,
});

function AdminPlatformSettingsRoute() {
	return <PlatformSettingsPage />;
}
