import { createFileRoute } from "@tanstack/react-router";
import { LandingStub } from "#/features/landing";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

function LandingPage() {
	return <LandingStub />;
}
