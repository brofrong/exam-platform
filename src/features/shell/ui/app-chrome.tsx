import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppHeader } from "#/features/shell";

export function AppChrome({ children }: { children: ReactNode }) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isLanding = pathname === "/" || pathname.startsWith("/v/");
	const isStudentApp = pathname === "/app" || pathname.startsWith("/app/");
	const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

	return (
		<>
			{isLanding || isStudentApp || isAdmin ? null : <AppHeader />}
			{children}
		</>
	);
}
