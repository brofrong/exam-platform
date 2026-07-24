import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dev")({
	component: DevLayout,
});

function DevLayout() {
	return <Outlet />;
}
