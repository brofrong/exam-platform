import { createFileRoute } from "@tanstack/react-router";
import { ReviewDetailPage } from "#/features/reviews";

export const Route = createFileRoute("/admin/reviews/$submissionId")({
	component: AdminReviewDetailRoute,
});

function AdminReviewDetailRoute() {
	const { submissionId } = Route.useParams();
	return <ReviewDetailPage submissionId={submissionId} />;
}
