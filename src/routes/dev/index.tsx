import { createFileRoute } from "@tanstack/react-router";
import { GalleryHome } from "#/features/dev-gallery";

export const Route = createFileRoute("/dev/")({
	component: DevHomePage,
});

function DevHomePage() {
	return <GalleryHome />;
}
