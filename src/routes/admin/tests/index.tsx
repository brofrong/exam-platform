import { createFileRoute } from "@tanstack/react-router";
import { TestGroupsListPage } from "#/features/admin-tests";

export const Route = createFileRoute("/admin/tests/")({
	component: AdminTestGroupsPage,
});

function AdminTestGroupsPage() {
	return <TestGroupsListPage />;
}
