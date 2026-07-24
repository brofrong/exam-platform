import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
	component: AppHomePage,
});

function AppHomePage() {
	const { user } = Route.useRouteContext();

	return (
		<main
			className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-start justify-center gap-6 px-4 py-10"
			data-testid="home-shell"
		>
			<div className="space-y-2">
				<p className="text-sm text-muted-foreground">Exam Platform</p>
				<h1 className="text-3xl font-semibold tracking-tight text-foreground">
					Скоро здесь будет кабинет
				</h1>
				<p className="text-muted-foreground">
					Вы вошли как {user.name}. Платформа для подготовки к ЕГЭ и ОГЭ в
					разработке.
				</p>
			</div>
		</main>
	);
}
