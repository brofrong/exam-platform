import { createFileRoute } from "@tanstack/react-router";
import { ProgramsListPage } from "#/features/programs";

export const Route = createFileRoute("/app/programs/")({
	component: ProgramsListRoute,
});

function ProgramsListRoute() {
	return <ProgramsListPage />;
}
