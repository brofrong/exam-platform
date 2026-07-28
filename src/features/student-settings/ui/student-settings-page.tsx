import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2Icon, LogOutIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ThemeModePicker } from "#/components/ThemeToggle";
import { authClient, useSession } from "#/shared/auth-client";
import { PageHeader } from "@/components/lms";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type SessionRow = {
	id: string;
	token: string;
	userAgent?: string | null;
	ipAddress?: string | null;
	createdAt: Date | string | number;
	expiresAt: Date | string | number;
};

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

function formatSessionDate(value: Date | string | number): string {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "—";
	}
	return date.toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function summarizeUserAgent(ua: string | null | undefined): string {
	if (!ua || ua.trim().length === 0) {
		return "Неизвестное устройство";
	}
	const compact = ua.trim();
	if (compact.length <= 72) {
		return compact;
	}
	return `${compact.slice(0, 71)}…`;
}

function SettingsSection({
	title,
	description,
	children,
	testId,
}: {
	title: string;
	description?: string;
	children: ReactNode;
	testId?: string;
}) {
	return (
		<section
			className="space-y-4 rounded-xl border bg-card p-4 sm:p-5"
			data-testid={testId}
		>
			<div className="space-y-1">
				<h2 className="font-heading text-base font-medium">{title}</h2>
				{description ? (
					<p className="text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>
			{children}
		</section>
	);
}

function errorMessage(error: unknown, fallback: string): string {
	if (
		error &&
		typeof error === "object" &&
		"message" in error &&
		typeof (error as { message: unknown }).message === "string"
	) {
		return (error as { message: string }).message;
	}
	return fallback;
}

async function uploadAvatar(file: File): Promise<string> {
	const formData = new FormData();
	formData.set("purpose", "avatar");
	formData.set("file", file);
	const response = await fetch("/api/upload", {
		method: "POST",
		body: formData,
		credentials: "include",
	});
	if (!response.ok) {
		let message = `Ошибка загрузки (${response.status})`;
		try {
			const data = (await response.json()) as { error?: string };
			if (data.error) {
				message = data.error;
			}
		} catch {
			// keep default
		}
		throw new Error(message);
	}
	const data = (await response.json()) as { key?: string };
	if (!data.key) {
		throw new Error("Сервер не вернул ключ файла");
	}
	return `/api/files/${data.key}`;
}

export function StudentSettingsPage() {
	const navigate = useNavigate();
	const { data: sessionData, isPending, refetch } = useSession();
	const user = sessionData?.user;
	const currentToken = sessionData?.session?.token;

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [image, setImage] = useState<string | null>(null);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [revokeOnPasswordChange, setRevokeOnPasswordChange] = useState(true);
	const [notifySupportReply, setNotifySupportReply] = useState(true);
	const [notifyReviewGraded, setNotifyReviewGraded] = useState(true);
	const [sessions, setSessions] = useState<SessionRow[]>([]);
	const [sessionsLoading, setSessionsLoading] = useState(true);
	const [busy, setBusy] = useState<string | null>(null);

	useEffect(() => {
		if (!user) {
			return;
		}
		setName(user.name ?? "");
		setEmail(user.email ?? "");
		setImage(user.image ?? null);
		setNotifySupportReply(user.notifySupportReply ?? true);
		setNotifyReviewGraded(user.notifyReviewGraded ?? true);
	}, [user]);

	useEffect(() => {
		if (!user) {
			return;
		}
		let cancelled = false;
		void (async () => {
			setSessionsLoading(true);
			const { data, error } = await authClient.listSessions();
			if (cancelled) {
				return;
			}
			if (error) {
				toast.error(errorMessage(error, "Не удалось загрузить сессии"));
				setSessions([]);
			} else {
				setSessions((data ?? []) as SessionRow[]);
			}
			setSessionsLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [user]);

	const loadSessions = async () => {
		setSessionsLoading(true);
		const { data, error } = await authClient.listSessions();
		if (error) {
			toast.error(errorMessage(error, "Не удалось загрузить сессии"));
			setSessions([]);
		} else {
			setSessions((data ?? []) as SessionRow[]);
		}
		setSessionsLoading(false);
	};

	if (isPending) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка настроек…</p>
			</main>
		);
	}

	if (!user) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">
					Сессия не найдена.{" "}
					<Link to="/login" className="underline">
						Войти
					</Link>
				</p>
			</main>
		);
	}

	const run = async (key: string, action: () => Promise<void>) => {
		setBusy(key);
		try {
			await action();
		} finally {
			setBusy(null);
		}
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10"
			data-testid="student-settings-page"
		>
			<PageHeader
				title="Настройки"
				description="Профиль, безопасность, тема и уведомления."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/app"
							className="hover:text-foreground"
							data-testid="settings-back-profile"
						>
							Мой профиль
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Настройки</span>
					</nav>
				}
			/>

			<SettingsSection
				title="Профиль"
				description="Имя и фото, которые видят преподаватели."
				testId="settings-profile"
			>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<Avatar className="size-16">
						{image ? <AvatarImage src={image} alt={name} /> : null}
						<AvatarFallback>{initialsFromName(name)}</AvatarFallback>
					</Avatar>
					<div className="flex flex-wrap gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp,image/gif"
							className="hidden"
							data-testid="settings-avatar-input"
							onChange={(event) => {
								const file = event.target.files?.[0];
								event.target.value = "";
								if (!file) {
									return;
								}
								void run("avatar", async () => {
									try {
										const nextImage = await uploadAvatar(file);
										const { error } = await authClient.updateUser({
											image: nextImage,
										});
										if (error) {
											throw new Error(
												errorMessage(error, "Не удалось сохранить аватар"),
											);
										}
										setImage(nextImage);
										await refetch();
										toast.success("Аватар обновлён");
									} catch (err) {
										toast.error(errorMessage(err, "Не удалось загрузить фото"));
									}
								});
							}}
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={busy === "avatar"}
							data-testid="settings-avatar-pick"
							onClick={() => fileInputRef.current?.click()}
						>
							{busy === "avatar" ? (
								<Loader2Icon className="size-4 animate-spin" />
							) : null}
							Сменить фото
						</Button>
						{image ? (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={busy === "avatar"}
								data-testid="settings-avatar-remove"
								onClick={() => {
									void run("avatar", async () => {
										const { error } = await authClient.updateUser({
											image: "",
										});
										if (error) {
											toast.error(
												errorMessage(error, "Не удалось удалить аватар"),
											);
											return;
										}
										setImage(null);
										await refetch();
										toast.success("Аватар удалён");
									});
								}}
							>
								Удалить
							</Button>
						) : null}
					</div>
				</div>

				<form
					className="space-y-3"
					onSubmit={(event) => {
						event.preventDefault();
						void run("name", async () => {
							const trimmed = name.trim();
							if (trimmed.length < 1) {
								toast.error("Укажите имя");
								return;
							}
							const { error } = await authClient.updateUser({ name: trimmed });
							if (error) {
								toast.error(errorMessage(error, "Не удалось сохранить имя"));
								return;
							}
							await refetch();
							toast.success("Имя сохранено");
						});
					}}
				>
					<div className="space-y-2">
						<Label htmlFor="settings-name">Отображаемое имя</Label>
						<Input
							id="settings-name"
							data-testid="settings-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							autoComplete="name"
						/>
					</div>
					<Button
						type="submit"
						size="sm"
						disabled={busy === "name"}
						data-testid="settings-name-save"
					>
						{busy === "name" ? (
							<Loader2Icon className="size-4 animate-spin" />
						) : null}
						Сохранить имя
					</Button>
				</form>
			</SettingsSection>

			<SettingsSection
				title="Контакты"
				description="Почта меняется сразу, без письма подтверждения."
				testId="settings-email"
			>
				<form
					className="space-y-3"
					onSubmit={(event) => {
						event.preventDefault();
						void run("email", async () => {
							const next = email.trim();
							if (!next.includes("@")) {
								toast.error("Укажите корректный email");
								return;
							}
							const { error } = await authClient.changeEmail({
								newEmail: next,
							});
							if (error) {
								toast.error(errorMessage(error, "Не удалось сменить email"));
								return;
							}
							await refetch();
							toast.success("Email обновлён");
						});
					}}
				>
					<div className="space-y-2">
						<Label htmlFor="settings-email">Email</Label>
						<Input
							id="settings-email"
							type="email"
							data-testid="settings-email-input"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							autoComplete="email"
						/>
					</div>
					<Button
						type="submit"
						size="sm"
						disabled={busy === "email"}
						data-testid="settings-email-save"
					>
						{busy === "email" ? (
							<Loader2Icon className="size-4 animate-spin" />
						) : null}
						Сохранить email
					</Button>
				</form>
			</SettingsSection>

			<SettingsSection
				title="Безопасность"
				description="Смена пароля. Можно завершить другие сессии."
				testId="settings-password"
			>
				<form
					className="space-y-3"
					onSubmit={(event) => {
						event.preventDefault();
						void run("password", async () => {
							if (newPassword.length < 8) {
								toast.error("Новый пароль — минимум 8 символов");
								return;
							}
							if (newPassword !== confirmPassword) {
								toast.error("Пароли не совпадают");
								return;
							}
							const { error } = await authClient.changePassword({
								currentPassword,
								newPassword,
								revokeOtherSessions: revokeOnPasswordChange,
							});
							if (error) {
								toast.error(errorMessage(error, "Не удалось сменить пароль"));
								return;
							}
							setCurrentPassword("");
							setNewPassword("");
							setConfirmPassword("");
							await loadSessions();
							toast.success("Пароль обновлён");
						});
					}}
				>
					<div className="space-y-2">
						<Label htmlFor="settings-current-password">Текущий пароль</Label>
						<Input
							id="settings-current-password"
							type="password"
							data-testid="settings-current-password"
							value={currentPassword}
							onChange={(event) => setCurrentPassword(event.target.value)}
							autoComplete="current-password"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="settings-new-password">Новый пароль</Label>
						<Input
							id="settings-new-password"
							type="password"
							data-testid="settings-new-password"
							value={newPassword}
							onChange={(event) => setNewPassword(event.target.value)}
							autoComplete="new-password"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="settings-confirm-password">Повтор пароля</Label>
						<Input
							id="settings-confirm-password"
							type="password"
							data-testid="settings-confirm-password"
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							autoComplete="new-password"
						/>
					</div>
					<div className="flex items-center justify-between gap-3 text-sm">
						<Label htmlFor="settings-password-revoke-others">
							Выйти на других устройствах
						</Label>
						<Switch
							id="settings-password-revoke-others"
							checked={revokeOnPasswordChange}
							onCheckedChange={setRevokeOnPasswordChange}
							data-testid="settings-password-revoke-others"
						/>
					</div>
					<Button
						type="submit"
						size="sm"
						disabled={busy === "password"}
						data-testid="settings-password-save"
					>
						{busy === "password" ? (
							<Loader2Icon className="size-4 animate-spin" />
						) : null}
						Сменить пароль
					</Button>
				</form>
			</SettingsSection>

			<SettingsSection
				title="Тема"
				description="Сохраняется на этом устройстве."
				testId="settings-theme"
			>
				<ThemeModePicker />
			</SettingsSection>

			<SettingsSection
				title="Уведомления"
				description="Пока только сохранение предпочтений — доставка появится позже."
				testId="settings-notifications"
			>
				<div className="space-y-3">
					<div className="flex items-center justify-between gap-3 text-sm">
						<Label htmlFor="settings-notify-support">
							Ответ в чате с преподавателем
						</Label>
						<Switch
							id="settings-notify-support"
							checked={notifySupportReply}
							data-testid="settings-notify-support"
							disabled={busy === "notifications"}
							onCheckedChange={(checked) => {
								setNotifySupportReply(checked);
								void run("notifications", async () => {
									const { error } = await authClient.updateUser({
										notifySupportReply: checked,
									});
									if (error) {
										setNotifySupportReply(!checked);
										toast.error(
											errorMessage(error, "Не удалось сохранить настройку"),
										);
										return;
									}
									await refetch();
								});
							}}
						/>
					</div>
					<div className="flex items-center justify-between gap-3 text-sm">
						<Label htmlFor="settings-notify-review">Работа проверена</Label>
						<Switch
							id="settings-notify-review"
							checked={notifyReviewGraded}
							data-testid="settings-notify-review"
							disabled={busy === "notifications"}
							onCheckedChange={(checked) => {
								setNotifyReviewGraded(checked);
								void run("notifications", async () => {
									const { error } = await authClient.updateUser({
										notifyReviewGraded: checked,
									});
									if (error) {
										setNotifyReviewGraded(!checked);
										toast.error(
											errorMessage(error, "Не удалось сохранить настройку"),
										);
										return;
									}
									await refetch();
								});
							}}
						/>
					</div>
				</div>
			</SettingsSection>

			<SettingsSection
				title="Сессии"
				description="Активные входы. «Выйти везде» завершает другие устройства."
				testId="settings-sessions"
			>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={busy === "sessions" || sessionsLoading}
						data-testid="settings-sessions-refresh"
						onClick={() => {
							void run("sessions", loadSessions);
						}}
					>
						Обновить
					</Button>
					<Button
						type="button"
						variant="destructive"
						size="sm"
						disabled={busy === "sessions" || sessionsLoading}
						data-testid="settings-sessions-revoke-others"
						onClick={() => {
							void run("sessions", async () => {
								const { error } = await authClient.revokeOtherSessions();
								if (error) {
									toast.error(
										errorMessage(error, "Не удалось завершить сессии"),
									);
									return;
								}
								await loadSessions();
								toast.success("Другие сессии завершены");
							});
						}}
					>
						Выйти везде
					</Button>
				</div>

				{sessionsLoading ? (
					<p className="text-sm text-muted-foreground">Загрузка сессий…</p>
				) : sessions.length === 0 ? (
					<p className="text-sm text-muted-foreground">Нет активных сессий</p>
				) : (
					<ul
						className="flex flex-col gap-2"
						data-testid="settings-sessions-list"
					>
						{sessions.map((row) => {
							const isCurrent = row.token === currentToken;
							return (
								<li
									key={row.id}
									className={cn(
										"flex flex-col gap-2 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
										isCurrent && "border-primary/40 bg-primary/5",
									)}
									data-testid={`settings-session-${row.id}`}
								>
									<div className="min-w-0 space-y-0.5">
										<p className="truncate text-sm font-medium">
											{summarizeUserAgent(row.userAgent)}
											{isCurrent ? (
												<span className="ml-2 text-xs font-normal text-primary">
													текущая
												</span>
											) : null}
										</p>
										<p className="text-xs text-muted-foreground">
											{row.ipAddress ?? "IP неизвестен"} ·{" "}
											{formatSessionDate(row.createdAt)}
										</p>
									</div>
									{isCurrent ? null : (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											disabled={busy === "sessions"}
											data-testid={`settings-session-revoke-${row.id}`}
											onClick={() => {
												void run("sessions", async () => {
													const { error } = await authClient.revokeSession({
														token: row.token,
													});
													if (error) {
														toast.error(
															errorMessage(
																error,
																"Не удалось завершить сессию",
															),
														);
														return;
													}
													await loadSessions();
													toast.success("Сессия завершена");
												});
											}}
										>
											Завершить
										</Button>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</SettingsSection>

			<section
				className="space-y-4 rounded-xl border border-destructive/20 bg-card p-4 sm:p-5"
				data-testid="settings-logout"
			>
				<div className="space-y-1">
					<h2 className="font-heading text-base font-medium">Выход</h2>
					<p className="text-sm text-muted-foreground">
						Завершите сессию на этом устройстве. Прогресс сохранится.
					</p>
				</div>
				<Button
					type="button"
					variant="destructive"
					className="w-full sm:w-auto"
					data-testid="nav-logout"
					disabled={busy === "logout"}
					onClick={() => {
						void run("logout", async () => {
							await authClient.signOut();
							await navigate({ to: "/login" });
						});
					}}
				>
					{busy === "logout" ? (
						<Loader2Icon className="size-4 animate-spin" />
					) : (
						<LogOutIcon className="size-4" />
					)}
					Выйти из аккаунта
				</Button>
			</section>
		</main>
	);
}
