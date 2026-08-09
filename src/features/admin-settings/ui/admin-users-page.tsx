import { Link } from "@tanstack/react-router";
import { UsersIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ROLES, type Role, roleLabel } from "#/shared/authz";
import { EmptyState, PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type AdminUserRow = {
	id: string;
	name: string;
	email: string;
	role: Role;
	createdAt: string;
};

function formatDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return "—";
	}
	return date.toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export function AdminUsersPage() {
	const [users, setUsers] = useState<AdminUserRow[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [savingId, setSavingId] = useState<string | null>(null);

	const loadUsers = useCallback(async () => {
		setError(null);
		try {
			const response = await fetch("/api/admin/users");
			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(payload?.error ?? "Не удалось загрузить пользователей");
			}
			const payload = (await response.json()) as { users: AdminUserRow[] };
			setUsers(payload.users);
		} catch (err) {
			setUsers([]);
			setError(err instanceof Error ? err.message : "Ошибка загрузки");
		}
	}, []);

	useEffect(() => {
		void loadUsers();
	}, [loadUsers]);

	const handleRoleChange = async (userId: string, role: Role) => {
		setSavingId(userId);
		setError(null);
		try {
			const response = await fetch("/api/admin/users", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, role }),
			});
			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(payload?.error ?? "Не удалось сменить роль");
			}
			const payload = (await response.json()) as { user: AdminUserRow };
			setUsers((prev) =>
				(prev ?? []).map((row) =>
					row.id === payload.user.id ? payload.user : row,
				),
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка сохранения");
		} finally {
			setSavingId(null);
		}
	};

	return (
		<main
			className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10"
			data-testid="admin-users-page"
		>
			<PageHeader
				title="Пользователи"
				description="Все зарегистрированные аккаунты. Смена роли сразу влияет на доступ к админке."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="users-admin-link"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Пользователи</span>
					</nav>
				}
			/>

			{error ? (
				<p className="text-sm text-destructive" data-testid="admin-users-error">
					{error}
				</p>
			) : null}

			{users === null ? (
				<p className="text-sm text-muted-foreground">Загрузка…</p>
			) : users.length === 0 ? (
				<EmptyState
					title="Пользователей пока нет"
					description="После регистрации они появятся в этом списке."
					icon={<UsersIcon className="size-5" />}
				/>
			) : (
				<div className="rounded-xl border">
					<Table data-testid="admin-users-table">
						<TableHeader>
							<TableRow>
								<TableHead>Имя</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Роль</TableHead>
								<TableHead>Регистрация</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<TableRow
									key={user.id}
									data-testid={`admin-user-row-${user.id}`}
								>
									<TableCell className="font-medium">{user.name}</TableCell>
									<TableCell className="text-muted-foreground">
										{user.email}
									</TableCell>
									<TableCell>
										<Select
											value={user.role}
											disabled={savingId === user.id}
											onValueChange={(value) => {
												if (isRoleValue(value)) {
													void handleRoleChange(user.id, value);
												}
											}}
										>
											<SelectTrigger
												className="w-44"
												data-testid={`admin-user-role-${user.id}`}
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{ROLES.map((role) => (
													<SelectItem key={role} value={role}>
														{roleLabel(role)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{formatDate(user.createdAt)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<div>
				<Button
					type="button"
					variant="outline"
					onClick={() => void loadUsers()}
					data-testid="admin-users-refresh"
				>
					Обновить
				</Button>
			</div>
		</main>
	);
}

function isRoleValue(value: string): value is Role {
	return (ROLES as readonly string[]).includes(value);
}
