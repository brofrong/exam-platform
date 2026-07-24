import { Link } from "@tanstack/react-router";
import ThemeToggle from "#/components/ThemeToggle";
import { UserMenu } from "#/features/shell/ui/user-menu";

export function AppHeader() {
	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 backdrop-blur-lg">
			<nav className="mx-auto flex w-full max-w-7xl items-center gap-3 py-3 sm:py-4">
				<h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground no-underline shadow-sm sm:px-4 sm:py-2"
					>
						<span className="h-2 w-2 rounded-full bg-primary" />
						Exam Platform
					</Link>
				</h2>

				<div className="ml-auto flex items-center gap-1.5 sm:gap-2">
					<ThemeToggle />
					<UserMenu />
				</div>
			</nav>
		</header>
	);
}
