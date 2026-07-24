import { createFileRoute } from "@tanstack/react-router";
import { ComponentPage } from "#/features/dev-gallery";

export const Route = createFileRoute("/dev/$slug")({
	component: DevComponentPage,
});

function DevComponentPage() {
	const { slug } = Route.useParams();
	return <ComponentPage slug={slug} />;
}
