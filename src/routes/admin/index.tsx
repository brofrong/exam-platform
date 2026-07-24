import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenIcon } from "lucide-react";
import { PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
	component: AdminHomePage,
});

function AdminHomePage() {
	return (
		<main
			className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-shell"
		>
			<PageHeader
				title="Админка"
				description="Управление программами, уроками и аналитикой."
			/>

			<nav className="flex flex-col gap-2" data-testid="admin-nav">
				<Button
					asChild
					variant="outline"
					className="h-auto justify-start gap-3 px-4 py-3"
					data-testid="admin-nav-programs"
				>
					<Link to="/admin/programs">
						<span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
							<BookOpenIcon className="size-4" />
						</span>
						<span className="text-left">
							<span className="block font-medium">Программы</span>
							<span className="block text-xs font-normal text-muted-foreground">
								CRUD программ, тем и привязка уроков
							</span>
						</span>
					</Link>
				</Button>
			</nav>
		</main>
	);
}
