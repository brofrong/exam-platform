import { createFileRoute } from "@tanstack/react-router";
import { ReviewDetailPage } from "#/features/reviews";

export const Route = createFileRoute("/admin/reviews/$attemptId")({
	component: AdminReviewDetailRoute,
});

function AdminReviewDetailRoute() {
	const { attemptId } = Route.useParams();
	return <ReviewDetailPage attemptId={attemptId} />;
}
