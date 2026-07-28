import { useRouterState } from "@tanstack/react-router";
import { AppHeader } from "#/features/shell";

export function AppChrome({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isLanding = pathname === "/";
	const isStudentApp = pathname === "/app" || pathname.startsWith("/app/");
	const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

	return (
		<>
			{isLanding || isStudentApp || isAdmin ? null : <AppHeader />}
			{children}
		</>
	);
}
