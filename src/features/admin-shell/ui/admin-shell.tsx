import { Link, useRouterState } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	BookOpenIcon,
	ClipboardCheckIcon,
	PanelLeftCloseIcon,
	PanelLeftOpenIcon,
	SettingsIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import {
	readSidebarCollapsed,
	writeSidebarCollapsed,
} from "#/features/admin-shell/lib/sidebar-collapsed";
import {
	AdminMoreMenu,
	type AdminMoreTarget,
	getAdminMoreLinks,
} from "#/features/admin-shell/ui/admin-more-menu";
import { ChangelogDialog } from "#/features/admin-shell/ui/changelog-dialog";
import { APP_VERSION } from "#/shared/app-version";
import type { Role } from "#/shared/authz";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

type AdminNavTarget = "/admin/programs" | "/admin/reviews" | AdminMoreTarget;

function isAdminPathActive(pathname: string, to: AdminNavTarget): boolean {
	switch (to) {
		case "/admin/programs":
			return isProgramsPath(pathname);
		case "/admin/reviews":
			return isReviewsPath(pathname);
		default:
			return pathname === to || pathname.startsWith(`${to}/`);
	}
}

function NavLink({
	to,
	active,
	icon,
	label,
	testId,
	variant,
	collapsed = false,
}: {
	to: AdminNavTarget;
	active: boolean;
	icon: ReactNode;
	label: string;
	testId: string;
	variant: "sidebar" | "tab";
	collapsed?: boolean;
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
			title={collapsed ? label : undefined}
			className={cn(
				"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
				collapsed && "justify-center gap-0 px-0",
				active
					? "bg-sidebar-accent text-sidebar-accent-foreground"
					: "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
			)}
		>
			<span className="inline-flex size-5 items-center justify-center">
				{icon}
			</span>
			{collapsed ? <span className="sr-only">{label}</span> : label}
		</Link>
	);
}

function initialsFromName(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function AdminAccountControls({
	userName,
	collapsed,
}: {
	userName: string;
	collapsed: boolean;
}) {
	return (
		<div
			className="flex flex-col items-stretch gap-2"
			data-testid="admin-account-controls"
		>
			<Link
				to="/app/settings"
				title={collapsed ? userName : undefined}
				className={cn(
					"flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent",
					collapsed && "justify-center px-0",
				)}
				data-testid="admin-nav-settings"
			>
				<Avatar size="sm">
					<AvatarFallback>{initialsFromName(userName)}</AvatarFallback>
				</Avatar>
				{collapsed ? (
					<span className="sr-only">{userName}</span>
				) : (
					<>
						<span className="truncate text-sm font-medium">{userName}</span>
						<SettingsIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
					</>
				)}
			</Link>
			<Button
				asChild
				variant="ghost"
				size="sm"
				className={cn(collapsed && "px-0 justify-center")}
				data-testid="admin-back-to-app"
			>
				<Link
					to="/app"
					title={collapsed ? "В приложение" : undefined}
					aria-label={collapsed ? "В приложение" : undefined}
				>
					<ArrowLeftIcon className="size-4" />
					{collapsed ? (
						<span className="sr-only">В приложение</span>
					) : (
						"В приложение"
					)}
				</Link>
			</Button>
		</div>
	);
}

export function AdminShell({
	children,
	role,
	userName,
}: {
	children: React.ReactNode;
	role: Role;
	userName: string;
}) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const moreLinks = getAdminMoreLinks(role);
	const [changelogOpen, setChangelogOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		setCollapsed(readSidebarCollapsed());
	}, []);

	const toggleCollapsed = () => {
		setCollapsed((prev) => {
			const next = !prev;
			writeSidebarCollapsed(next);
			return next;
		});
	};

	return (
		<div className="flex min-h-svh bg-background" data-testid="admin-shell">
			<aside
				className={cn(
					"sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex",
					collapsed ? "w-14" : "w-60",
				)}
				data-testid="admin-sidebar"
				data-collapsed={collapsed ? "true" : "false"}
			>
				<div
					className={cn(
						"flex items-center border-b border-sidebar-border px-3 py-3",
						collapsed ? "justify-center px-1" : "justify-between gap-2",
					)}
				>
					{!collapsed && (
						<div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight text-sidebar-foreground">
							<Link
								to="/admin/programs"
								className="inline-flex items-center gap-2 no-underline"
								data-testid="admin-brand"
							>
								<span className="size-2 rounded-full bg-primary" />
								Админка
							</Link>
							<button
								type="button"
								className="text-[10px] font-normal leading-none text-muted-foreground transition-colors hover:text-foreground"
								data-testid="admin-version"
								onClick={() => setChangelogOpen(true)}
							>
								v{APP_VERSION}
							</button>
						</div>
					)}
					{collapsed && (
						<Link
							to="/admin/programs"
							className="sr-only"
							data-testid="admin-brand"
						>
							Админка
						</Link>
					)}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className={cn("shrink-0", collapsed && "px-0")}
						onClick={toggleCollapsed}
						data-testid="admin-sidebar-collapse"
						aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
						title={collapsed ? "Развернуть" : "Свернуть"}
					>
						{collapsed ? (
							<PanelLeftOpenIcon className="size-4" />
						) : (
							<PanelLeftCloseIcon className="size-4" />
						)}
					</Button>
				</div>

				<nav
					className={cn("flex flex-1 flex-col gap-1 p-3", collapsed && "px-1")}
					aria-label="Админка"
				>
					<NavLink
						to="/admin/programs"
						active={isAdminPathActive(pathname, "/admin/programs")}
						icon={<BookOpenIcon className="size-4" />}
						label="Программы"
						testId="admin-nav-programs"
						variant="sidebar"
						collapsed={collapsed}
					/>
					<NavLink
						to="/admin/reviews"
						active={isAdminPathActive(pathname, "/admin/reviews")}
						icon={<ClipboardCheckIcon className="size-4" />}
						label="Проверка"
						testId="admin-nav-reviews"
						variant="sidebar"
						collapsed={collapsed}
					/>
					{moreLinks.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							active={isAdminPathActive(pathname, link.to)}
							icon={link.icon}
							label={link.label}
							testId={link.testId}
							variant="sidebar"
							collapsed={collapsed}
						/>
					))}
				</nav>

				<div
					className={cn(
						"border-t border-sidebar-border p-3",
						collapsed && "px-1",
					)}
				>
					<AdminAccountControls userName={userName} collapsed={collapsed} />
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
						active={isAdminPathActive(pathname, "/admin/programs")}
						icon={<BookOpenIcon className="size-4" />}
						label="Программы"
						testId="admin-nav-programs"
						variant="tab"
					/>
					<NavLink
						to="/admin/reviews"
						active={isAdminPathActive(pathname, "/admin/reviews")}
						icon={<ClipboardCheckIcon className="size-4" />}
						label="Проверка"
						testId="admin-nav-reviews"
						variant="tab"
					/>
					<AdminMoreMenu
						role={role}
						active={moreLinks.some((link) =>
							isAdminPathActive(pathname, link.to),
						)}
					/>
				</div>
			</nav>

			<ChangelogDialog open={changelogOpen} onOpenChange={setChangelogOpen} />
		</div>
	);
}
