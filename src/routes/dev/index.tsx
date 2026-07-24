import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dev/")({
	component: DevHomePage,
});

function DevHomePage() {
	return (
		<main
			className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-10"
			data-testid="dev-shell"
		>
			<h1 className="text-3xl font-semibold tracking-tight text-foreground">
				Dev gallery coming soon
			</h1>
			<p className="text-muted-foreground">
				Галерея UI-компонентов появится здесь.
			</p>
		</main>
	);
}
