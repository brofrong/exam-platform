import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProgramsWorkspacePage } from "#/features/admin-programs/ui/programs-workspace-page";

const programsSearchSchema = z.object({
	topic: z.string().optional(),
	lesson: z.string().optional(),
});

export const Route = createFileRoute("/admin/programs/")({
	validateSearch: programsSearchSchema,
	component: AdminProgramsPage,
});

function AdminProgramsPage() {
	const search = Route.useSearch();
	return <ProgramsWorkspacePage search={search} />;
}
