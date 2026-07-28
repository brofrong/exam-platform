import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpenIcon, UserRoundIcon } from "lucide-react";
import ThemeToggle from "#/components/ThemeToggle";
import { authClient } from "#/shared/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isProgramsPath(pathname: string): boolean {
	return pathname === "/app/programs" || pathname.startsWith("/app/programs/");
}

function isProfilePath(pathname: string): boolean {
	if (isProgramsPath(pathname)) {
		return false;
	}
	return (
		pathname === "/app" ||
		pathname === "/app/" ||
		pathname.startsWith("/app/support")
	);
}

function NavLink({
	to,
	active,
	icon,
	label,
	testId,
	variant,
}: {
	to: "/app" | "/app/programs";
	active: boolean;
	icon: React.ReactNode;
	label: string;
	testId: string;
	variant: "sidebar" | "tab";
}) {
	if (variant === "tab") {
		return (
			<Link
				to={to}
				data-testid={testId}
				aria-current={active ? "page" : undefined}
				className={cn(
					"flex flex-1 flex-col items-center gap-1 px-2 py-2 text-xs font-medium transition-colors",
					active
						? "text-foreground"
						: "text-muted-foreground hover:text-foreground",
				)}
			>
				<span
					className={cn(
						"inline-flex size-9 items-center justify-center rounded-xl transition-colors",
						active ? "bg-primary/10 text-primary" : "bg-transparent",
					)}
				>
					{icon}
				</span>
				{label}
			</Link>
		);
	}

	return (
		<Link
			to={to}
			data-testid={testId}
			aria-current={active ? "page" : undefined}
			className={cn(
				"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
				active
					? "bg-sidebar-accent text-sidebar-accent-foreground"
					: "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
			)}
		>
			<span className="inline-flex size-5 items-center justify-center">{icon}</span>
			{label}
		</Link>
	);
}

export function StudentAccountControls({
	className,
	compact = false,
}: {
	className?: string;
	compact?: boolean;
}) {
	const navigate = useNavigate();

	const handleLogout = async () => {
		await authClient.signOut();
		await navigate({ to: "/login" });
	};

	return (
		<div
			className={cn(
				"flex items-center gap-2",
				compact ? "justify-between" : "flex-col items-stretch",
				className,
			)}
			data-testid="student-account-controls"
		>
			<div className={cn("flex items-center", compact ? "gap-2" : "justify-between")}>
				{!compact ? (
					<span className="text-xs text-muted-foreground">Тема</span>
				) : null}
				<ThemeToggle />
			</div>
			<Button
				type="button"
				variant={compact ? "outline" : "ghost"}
				size="sm"
				className={cn(!compact && "justify-start")}
				data-testid="nav-logout"
				onClick={() => {
					void handleLogout();
				}}
			>
				Выйти
			</Button>
		</div>
	);
}

export function StudentShell({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const programsActive = isProgramsPath(pathname);
	const profileActive = isProfilePath(pathname);

	return (
		<div className="flex min-h-svh bg-background" data-testid="student-shell">
			<aside
				className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
				data-testid="student-sidebar"
			>
				<div className="border-b border-sidebar-border px-4 py-4">
					<Link
						to="/app"
						className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-sidebar-foreground no-underline"
						data-testid="student-brand"
					>
						<span className="size-2 rounded-full bg-primary" />
						Exam Platform
					</Link>
				</div>

				<nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Кабинет">
					<NavLink
						to="/app/programs"
						active={programsActive}
						icon={<BookOpenIcon className="size-4" />}
						label="Программы"
						testId="student-nav-programs"
						variant="sidebar"
					/>
					<NavLink
						to="/app"
						active={profileActive}
						icon={<UserRoundIcon className="size-4" />}
						label="Мой профиль"
						testId="student-nav-profile"
						variant="sidebar"
					/>
				</nav>

				<div className="border-t border-sidebar-border p-3">
					<StudentAccountControls />
				</div>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col pb-[4.75rem] md:pb-0">
				{children}
			</div>

			<nav
				className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg md:hidden"
				data-testid="student-bottom-nav"
				aria-label="Главное меню"
			>
				<div className="mx-auto flex max-w-lg">
					{/* Mobile uses same test ids as sidebar — only one visible at a time */}
					<NavLink
						to="/app/programs"
						active={programsActive}
						icon={<BookOpenIcon className="size-4" />}
						label="Программы"
						testId="student-nav-programs"
						variant="tab"
					/>
					<NavLink
						to="/app"
						active={profileActive}
						icon={<UserRoundIcon className="size-4" />}
						label="Мой профиль"
						testId="student-nav-profile"
						variant="tab"
					/>
				</div>
			</nav>
		</div>
	);
}
