import { createFileRoute } from "@tanstack/react-router";
import { InvitesPage } from "#/features/invites";

export const Route = createFileRoute("/admin/invites/")({
	component: AdminInvitesPage,
});

function AdminInvitesPage() {
	return <InvitesPage />;
}
