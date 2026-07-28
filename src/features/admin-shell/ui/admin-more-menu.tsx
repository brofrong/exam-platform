import { Link } from "@tanstack/react-router";
import {
	ChartColumnIcon,
	LinkIcon,
	MessageCircleIcon,
	MoreHorizontalIcon,
} from "lucide-react";
import { useState } from "react";
import { can, type Role } from "#/shared/authz";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type MoreLink = {
	to: "/admin/analytics" | "/admin/support" | "/admin/invites";
	label: string;
	description: string;
	testId: string;
	icon: React.ReactNode;
};

function moreLinks(role: Role): MoreLink[] {
	const links: MoreLink[] = [];
	if (can(role, "analytics:read")) {
		links.push({
			to: "/admin/analytics",
			label: "Аналитика",
			description: "Прогресс учеников",
			testId: "admin-nav-analytics",
			icon: <ChartColumnIcon className="size-4" />,
		});
	}
	links.push(
		{
			to: "/admin/support",
			label: "Поддержка",
			description: "Чаты с учениками",
			testId: "admin-nav-support",
			icon: <MessageCircleIcon className="size-4" />,
		},
		{
			to: "/admin/invites",
			label: "Приглашения",
			description: "Ссылки на программы",
			testId: "admin-nav-invites",
			icon: <LinkIcon className="size-4" />,
		},
	);
	return links;
}

export function AdminMoreMenu({
	role,
	variant,
	active,
}: {
	role: Role;
	variant: "sidebar" | "tab";
	active: boolean;
}) {
	const links = moreLinks(role);
	const [sheetOpen, setSheetOpen] = useState(false);

	if (variant === "sidebar") {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						data-testid="admin-nav-more"
						aria-current={active ? "page" : undefined}
						className={cn(
							"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
							active
								? "bg-sidebar-accent text-sidebar-accent-foreground"
								: "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
						)}
					>
						<span className="inline-flex size-5 items-center justify-center">
							<MoreHorizontalIcon className="size-4" />
						</span>
						Ещё
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-56">
					{links.map((link) => (
						<DropdownMenuItem key={link.to} asChild>
							<Link to={link.to} data-testid={link.testId}>
								{link.icon}
								<span>{link.label}</span>
							</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
			<SheetTrigger asChild>
				<button
					type="button"
					data-testid="admin-nav-more"
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
						<MoreHorizontalIcon className="size-4" />
					</span>
					Ещё
				</button>
			</SheetTrigger>
			<SheetContent side="bottom" className="gap-0 rounded-t-2xl">
				<SheetHeader className="pb-2">
					<SheetTitle>Ещё</SheetTitle>
				</SheetHeader>
				<nav
					className="flex flex-col gap-1 pb-6"
					data-testid="admin-more-sheet"
				>
					{links.map((link) => (
						<Button
							key={link.to}
							asChild
							variant="ghost"
							className="h-auto justify-start gap-3 px-3 py-3"
							onClick={() => setSheetOpen(false)}
						>
							<Link to={link.to} data-testid={link.testId}>
								<span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
									{link.icon}
								</span>
								<span className="text-left">
									<span className="block font-medium">{link.label}</span>
									<span className="block text-xs font-normal text-muted-foreground">
										{link.description}
									</span>
								</span>
							</Link>
						</Button>
					))}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
