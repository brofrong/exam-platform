import { Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "#/shared/auth-client";
import { can, type Role } from "#/shared/authz";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function toRole(value: unknown): Role {
	return value === "admin" ? "admin" : "student";
}

export function UserMenu() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const user = session?.user;

	if (isPending) {
		return <div className="size-8" aria-hidden="true" />;
	}

	if (!user) {
		return (
			<Button asChild size="sm" data-testid="nav-login">
				<Link to="/login">Войти</Link>
			</Button>
		);
	}

	const role = toRole(user.role);
	const showAdmin = can(role, "program:write");
	const initials = initialsFromName(user.name);

	const handleLogout = async () => {
		await authClient.signOut();
		await navigate({ to: "/login" });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="rounded-full"
					data-testid="nav-user-menu"
					aria-label="Меню пользователя"
				>
					<Avatar size="sm">
						{user.image ? (
							<AvatarImage src={user.image} alt={user.name} />
						) : null}
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-44">
				<DropdownMenuItem asChild>
					<Link to="/app" data-testid="nav-home">
						Кабинет
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/app/settings" data-testid="nav-settings">
						Настройки
					</Link>
				</DropdownMenuItem>
				{showAdmin ? (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link to="/admin" data-testid="nav-admin">
								Админка
							</Link>
						</DropdownMenuItem>
					</>
				) : null}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					data-testid="nav-logout"
					onSelect={() => {
						void handleLogout();
					}}
				>
					Выйти
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
