import { createFileRoute } from "@tanstack/react-router";
import { ProgramsWorkspaceIndexPane } from "#/features/admin-programs/ui/programs-workspace-page";

export const Route = createFileRoute("/admin/programs/")({
	component: AdminProgramsPage,
});

function AdminProgramsPage() {
	return <ProgramsWorkspaceIndexPane />;
}
