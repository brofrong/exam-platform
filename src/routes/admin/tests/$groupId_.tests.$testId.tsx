import { createFileRoute } from "@tanstack/react-router";
import { TestEditPage } from "#/features/admin-tests";

export const Route = createFileRoute("/admin/tests/$groupId_/tests/$testId")({
	component: AdminTestEditPage,
});

function AdminTestEditPage() {
	const { groupId, testId } = Route.useParams();
	return <TestEditPage groupId={groupId} testId={testId} />;
}
