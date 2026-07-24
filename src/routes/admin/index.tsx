import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
	component: AdminHomePage,
});

function AdminHomePage() {
	return (
		<main
			className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-10"
			data-testid="admin-shell"
		>
			<h1 className="text-3xl font-semibold tracking-tight text-foreground">
				Админка — скоро
			</h1>
			<p className="text-muted-foreground">
				Здесь появится CMS программ, уроков и аналитики.
			</p>
		</main>
	);
}
