import { createFileRoute } from "@tanstack/react-router";
import { ProgramDetailPage } from "#/features/admin-programs";

export const Route = createFileRoute("/admin/programs/$programId")({
	component: AdminProgramDetailPage,
});

function AdminProgramDetailPage() {
	const { programId } = Route.useParams();
	return <ProgramDetailPage programId={programId} />;
}
