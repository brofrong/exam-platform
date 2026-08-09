import { createFileRoute } from "@tanstack/react-router";
import { TestGroupDetailPage } from "#/features/admin-tests";

export const Route = createFileRoute("/admin/tests/$groupId")({
	component: AdminTestGroupDetailPage,
});

function AdminTestGroupDetailPage() {
	const { groupId } = Route.useParams();
	return <TestGroupDetailPage groupId={groupId} />;
}
