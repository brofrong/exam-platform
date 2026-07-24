import { createFileRoute } from "@tanstack/react-router";
import { ReviewsQueuePage } from "#/features/reviews";

export const Route = createFileRoute("/admin/reviews/")({
	component: AdminReviewsPage,
});

function AdminReviewsPage() {
	return <ReviewsQueuePage />;
}
