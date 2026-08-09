import { Link } from "@tanstack/react-router";
import {
	ChartColumnIcon,
	LinkIcon,
	ListChecksIcon,
	MessageCircleIcon,
	MoreHorizontalIcon,
	SparklesIcon,
	UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { SeedDemoCatalogButton } from "#/features/admin-seed";
import { can, type Role } from "#/shared/authz";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type AdminMoreTarget =
	| "/admin/analytics"
	| "/admin/tests"
	| "/admin/support"
	| "/admin/invites"
	| "/admin/users"
	| "/admin/settings";

export type AdminMoreLink = {
	to: AdminMoreTarget;
	label: string;
	description: string;
	testId: string;
	icon: React.ReactNode;
};

export function getAdminMoreLinks(role: Role): AdminMoreLink[] {
	const links: AdminMoreLink[] = [];
	if (can(role, "analytics:read")) {
		links.push({
			to: "/admin/analytics",
			label: "Аналитика",
			description: "Прогресс учеников",
			testId: "admin-nav-analytics",
			icon: <ChartColumnIcon className="size-4" />,
		});
	}
	if (can(role, "lesson:write")) {
		links.push({
			to: "/admin/tests",
			label: "Тесты",
			description: "Банки вопросов для практики",
			testId: "admin-nav-tests",
			icon: <ListChecksIcon className="size-4" />,
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
	if (can(role, "users:manage")) {
		links.push({
			to: "/admin/users",
			label: "Пользователи",
			description: "Роли и список аккаунтов",
			testId: "admin-nav-users",
			icon: <UsersIcon className="size-4" />,
		});
	}
	if (can(role, "settings:ai")) {
		links.push({
			to: "/admin/settings",
			label: "ИИ",
			description: "OpenRouter: токен и модель",
			testId: "admin-nav-ai-settings",
			icon: <SparklesIcon className="size-4" />,
		});
	}
	return links;
}

export function AdminMoreMenu({
	role,
	active,
}: {
	role: Role;
	active: boolean;
}) {
	const links = getAdminMoreLinks(role);
	const [sheetOpen, setSheetOpen] = useState(false);

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
					<SeedDemoCatalogButton
						variant="sheet"
						onDone={() => setSheetOpen(false)}
					/>
				</nav>
			</SheetContent>
		</Sheet>
	);
}
