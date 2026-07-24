import { createFileRoute } from "@tanstack/react-router";
import { ProgramsListPage } from "#/features/admin-programs";

export const Route = createFileRoute("/admin/programs/")({
	component: AdminProgramsPage,
});

function AdminProgramsPage() {
	return <ProgramsListPage />;
}
