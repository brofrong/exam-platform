import { useRouterState } from "@tanstack/react-router";
import { AppHeader } from "#/features/shell";

export function AppChrome({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isLanding = pathname === "/";

	return (
		<>
			{isLanding ? null : <AppHeader />}
			{children}
		</>
	);
}
