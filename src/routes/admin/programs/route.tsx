import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProgramsWorkspaceLayout } from "#/features/admin-programs/ui/programs-workspace-page";

const programsSearchSchema = z.object({
	topic: z.string().optional(),
	lesson: z.string().optional(),
	activity: z.string().optional(),
});

export const Route = createFileRoute("/admin/programs")({
	validateSearch: programsSearchSchema,
	component: AdminProgramsLayout,
});

function AdminProgramsLayout() {
	return <ProgramsWorkspaceLayout />;
}
