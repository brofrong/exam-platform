import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpenIcon, ClipboardCheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import ThemeToggle from "#/components/ThemeToggle";
import { SeedDemoCatalogButton } from "#/features/admin-seed";
import { AdminMoreMenu } from "#/features/admin-shell/ui/admin-more-menu";
import { authClient } from "#/shared/auth-client";
import type { Role } from "#/shared/authz";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isProgramsPath(pathname: string): boolean {
	return (
		pathname === "/admin/programs" || pathname.startsWith("/admin/programs/")
	);
}

function isReviewsPath(pathname: string): boolean {
	return (
		pathname === "/admin/reviews" || pathname.startsWith("/admin/reviews/")
	);
}

function isMorePath(pathname: string): boolean {
	if (isProgramsPath(pathname) || isReviewsPath(pathname)) {
		return false;
	}
	return (
		pathname.startsWith("/admin/analytics") ||
		pathname.startsWith("/admin/support") ||
		pathname.startsWith("/admin/invites") ||
		pathname.startsWith("/admin/lessons")
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
	to: "/admin/programs" | "/admin/reviews";
	active: boolean;
	icon: ReactNode;
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
			<span className="inline-flex size-5 items-center justify-center">
				{icon}
			</span>
			{label}
		</Link>
	);
}

function AdminAccountControls() {
	const navigate = useNavigate();

	const handleLogout = async () => {
		await authClient.signOut();
		await navigate({ to: "/login" });
	};

	return (
		<div
			className="flex flex-col items-stretch gap-2"
			data-testid="admin-account-controls"
		>
			<div className="flex items-center justify-between">
				<span className="text-xs text-muted-foreground">Тема</span>
				<ThemeToggle />
			</div>
			<SeedDemoCatalogButton variant="sidebar" />
			<Button
				type="button"
				variant="outline"
				size="sm"
				data-testid="admin-nav-logout"
				onClick={handleLogout}
			>
				Выйти
			</Button>
		</div>
	);
}

export function AdminShell({
	children,
	role,
}: {
	children: React.ReactNode;
	role: Role;
}) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const programsActive = isProgramsPath(pathname);
	const reviewsActive = isReviewsPath(pathname);
	const moreActive = isMorePath(pathname);

	return (
		<div className="flex min-h-svh bg-background" data-testid="admin-shell">
			<aside
				className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
				data-testid="admin-sidebar"
			>
				<div className="border-b border-sidebar-border px-4 py-4">
					<Link
						to="/admin/programs"
						className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-sidebar-foreground no-underline"
						data-testid="admin-brand"
					>
						<span className="size-2 rounded-full bg-primary" />
						Админка
					</Link>
				</div>

				<nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Админка">
					<NavLink
						to="/admin/programs"
						active={programsActive}
						icon={<BookOpenIcon className="size-4" />}
						label="Программы"
						testId="admin-nav-programs"
						variant="sidebar"
					/>
					<NavLink
						to="/admin/reviews"
						active={reviewsActive}
						icon={<ClipboardCheckIcon className="size-4" />}
						label="Проверка"
						testId="admin-nav-reviews"
						variant="sidebar"
					/>
					<AdminMoreMenu role={role} variant="sidebar" active={moreActive} />
				</nav>

				<div className="border-t border-sidebar-border p-3">
					<AdminAccountControls />
				</div>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col pb-[4.75rem] md:pb-0">
				{children}
			</div>

			<nav
				className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg md:hidden"
				data-testid="admin-bottom-nav"
				aria-label="Главное меню"
			>
				<div className="mx-auto flex max-w-lg">
					<NavLink
						to="/admin/programs"
						active={programsActive}
						icon={<BookOpenIcon className="size-4" />}
						label="Программы"
						testId="admin-nav-programs"
						variant="tab"
					/>
					<NavLink
						to="/admin/reviews"
						active={reviewsActive}
						icon={<ClipboardCheckIcon className="size-4" />}
						label="Проверка"
						testId="admin-nav-reviews"
						variant="tab"
					/>
					<AdminMoreMenu role={role} variant="tab" active={moreActive} />
				</div>
			</nav>
		</div>
	);
}
