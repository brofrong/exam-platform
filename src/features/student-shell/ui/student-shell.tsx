import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpenIcon, HomeIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import ThemeToggle from "#/components/ThemeToggle";
import { authClient } from "#/shared/auth-client";
import { type Role, roleLabel } from "#/shared/authz";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShellUser = {
	name: string;
	role: Role;
};

function isProgramsPath(pathname: string): boolean {
	return pathname === "/app/programs" || pathname.startsWith("/app/programs/");
}

function isSettingsPath(pathname: string): boolean {
	return pathname === "/app/settings" || pathname.startsWith("/app/settings/");
}

function isHomePath(pathname: string): boolean {
	if (isProgramsPath(pathname) || isSettingsPath(pathname)) {
		return false;
	}
	return (
		pathname === "/app" ||
		pathname === "/app/" ||
		pathname.startsWith("/app/support")
	);
}

function initialsFromName(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return "?";
	}
	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}
	return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function NavLink({
	to,
	active,
	icon,
	label,
	testId,
	variant,
	className,
}: {
	to: "/app" | "/app/programs" | "/app/settings";
	active: boolean;
	icon: ReactNode;
	label: string;
	testId: string;
	variant: "sidebar" | "tab";
	className?: string;
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
					className,
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
				className,
			)}
		>
			<span className="inline-flex size-5 items-center justify-center">
				{icon}
			</span>
			{label}
		</Link>
	);
}

function Brand({ testId }: { testId: string }) {
	return (
		<Link
			to="/app"
			className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground no-underline"
			data-testid={testId}
		>
			<span className="size-2 rounded-full bg-primary" />
			PHYS&MATH
		</Link>
	);
}

function UserBlock({ user }: { user: ShellUser }) {
	const navigate = useNavigate();
	const [loggingOut, setLoggingOut] = useState(false);

	return (
		<div
			className="space-y-1 border-t border-sidebar-border p-3"
			data-testid="student-user-block"
		>
			<div className="flex items-center gap-2.5 px-1.5 py-1.5">
				<Avatar className="size-9">
					<AvatarFallback className="text-xs font-medium">
						{initialsFromName(user.name)}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-sidebar-foreground">
						{user.name}
					</p>
					<p className="truncate text-xs text-sidebar-foreground/60">
						{roleLabel(user.role)}
					</p>
				</div>
				<ThemeToggle />
			</div>
			<Button
				type="button"
				variant="ghost"
				className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
				disabled={loggingOut}
				data-testid="student-logout"
				onClick={() => {
					setLoggingOut(true);
					void authClient.signOut().then(() => navigate({ to: "/login" }));
				}}
			>
				<LogOutIcon className="size-4" />
				{loggingOut ? "Выход…" : "Выйти"}
			</Button>
		</div>
	);
}

export function StudentShell({
	children,
	user,
}: {
	children: ReactNode;
	user: ShellUser;
}) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const programsActive = isProgramsPath(pathname);
	const homeActive = isHomePath(pathname);
	const settingsActive = isSettingsPath(pathname);

	return (
		<div className="flex min-h-svh bg-background" data-testid="student-shell">
			<aside
				className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
				data-testid="student-sidebar"
			>
				<div className="border-b border-sidebar-border px-4 py-4">
					<Brand testId="student-brand" />
				</div>

				<nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Кабинет">
					<NavLink
						to="/app/programs"
						active={programsActive}
						icon={<BookOpenIcon className="size-4" />}
						label="Программы"
						testId="student-sidebar-programs"
						variant="sidebar"
					/>
					<NavLink
						to="/app"
						active={homeActive}
						icon={<HomeIcon className="size-4" />}
						label="Главная"
						testId="student-sidebar-profile"
						variant="sidebar"
					/>
					<NavLink
						to="/app/settings"
						active={settingsActive}
						icon={<SettingsIcon className="size-4" />}
						label="Настройки"
						testId="student-sidebar-settings"
						variant="sidebar"
					/>
				</nav>

				<UserBlock user={user} />
			</aside>

			<div className="flex min-w-0 flex-1 flex-col pb-[4.75rem] md:pb-0">
				<header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur-lg md:hidden">
					<Brand testId="student-mobile-brand" />
					<ThemeToggle />
				</header>
				{children}
			</div>

			<nav
				className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
				data-testid="student-bottom-nav"
				aria-label="Главное меню"
			>
				<div className="mx-auto flex max-w-lg">
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
						active={homeActive || settingsActive}
						icon={<HomeIcon className="size-4" />}
						label="Главная"
						testId="student-nav-profile"
						variant="tab"
					/>
				</div>
			</nav>
		</div>
	);
}
