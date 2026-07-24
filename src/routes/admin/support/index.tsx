import { createFileRoute } from "@tanstack/react-router";
import { AdminSupportInboxPage } from "#/features/support-chat";

export const Route = createFileRoute("/admin/support/")({
	component: AdminSupportIndexPage,
});

function AdminSupportIndexPage() {
	return <AdminSupportInboxPage />;
}
