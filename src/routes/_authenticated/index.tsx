import { createFileRoute } from "@tanstack/react-router";
import { ChatApp } from "#/features/chat";

export const Route = createFileRoute("/_authenticated/")({
	component: AuthenticatedChatPage,
});

function AuthenticatedChatPage() {
	const { user } = Route.useRouteContext();
	return <ChatApp user={user} />;
}
