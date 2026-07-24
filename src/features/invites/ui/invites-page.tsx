import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { CopyIcon, LinkIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreatedInvite = {
	token: string;
	url: string;
};

function inviteUrl(token: string): string {
	if (typeof window === "undefined") {
		return `/invite/${token}`;
	}
	return `${window.location.origin}/invite/${token}`;
}

function formatDateTime(ms: number | null | undefined): string {
	if (ms == null) {
		return "—";
	}
	return new Date(ms).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function InvitesPage() {
	const zero = useZero();
	const [programs] = useQuery(queries.programs());
	const [invites] = useQuery(queries.programInvites());

	const [programIds, setProgramIds] = useState<string[]>([]);
	const [inviteeEmail, setInviteeEmail] = useState("");
	const [inviteeName, setInviteeName] = useState("");
	const [expiresAtLocal, setExpiresAtLocal] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [created, setCreated] = useState<CreatedInvite | null>(null);
	const [copied, setCopied] = useState(false);

	function toggleProgram(id: string, checked: boolean) {
		setProgramIds((prev) =>
			checked ? [...prev, id] : prev.filter((item) => item !== id),
		);
	}

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		setCopied(false);

		if (programIds.length === 0) {
			setError("Выберите хотя бы одну программу");
			return;
		}

		const token = crypto.randomUUID();
		const expiresAt =
			expiresAtLocal.trim().length === 0
				? null
				: new Date(expiresAtLocal).getTime();

		if (expiresAt != null && Number.isNaN(expiresAt)) {
			setError("Некорректная дата истечения");
			return;
		}

		setIsSubmitting(true);
		try {
			await zero.mutate(
				mutators.createProgramInvite({
					token,
					programIds,
					inviteeEmail: inviteeEmail.trim() || null,
					inviteeName: inviteeName.trim() || null,
					expiresAt,
				}),
			);
			setCreated({ token, url: inviteUrl(token) });
			setProgramIds([]);
			setInviteeEmail("");
			setInviteeName("");
			setExpiresAtLocal("");
		} catch {
			setError("Не удалось создать приглашение");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCopy = async (url: string) => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-invites-page"
		>
			<PageHeader
				title="Приглашения"
				description="Одноразовые ссылки на одну или несколько программ."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="invites-admin-link"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Приглашения</span>
					</nav>
				}
			/>

			<form
				className="grid gap-4 rounded-xl border border-border p-4"
				data-testid="invite-create-form"
				onSubmit={(event) => {
					void handleCreate(event);
				}}
			>
				<div className="grid gap-2 sm:grid-cols-2">
					<div className="grid gap-1.5">
						<Label htmlFor="invitee-name">Имя ученика (опционально)</Label>
						<Input
							id="invitee-name"
							data-testid="invite-invitee-name"
							value={inviteeName}
							onChange={(event) => setInviteeName(event.target.value)}
							placeholder="Анна"
						/>
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="invitee-email">Email (опционально)</Label>
						<Input
							id="invitee-email"
							type="email"
							data-testid="invite-invitee-email"
							value={inviteeEmail}
							onChange={(event) => setInviteeEmail(event.target.value)}
							placeholder="student@school.ru"
						/>
					</div>
				</div>

				<div className="grid gap-1.5">
					<Label htmlFor="invite-expires">Срок действия (опционально)</Label>
					<Input
						id="invite-expires"
						type="datetime-local"
						data-testid="invite-expires-at"
						value={expiresAtLocal}
						onChange={(event) => setExpiresAtLocal(event.target.value)}
					/>
				</div>

				<div className="grid gap-3">
					<p className="text-sm font-medium">Программы</p>
					{!programs || programs.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Сначала создайте хотя бы одну программу.
						</p>
					) : (
						<div
							className="grid gap-3 rounded-lg border border-border p-3"
							data-testid="invite-programs"
						>
							{programs.map((program) => (
								<div key={program.id} className="flex items-center gap-2">
									<Checkbox
										id={`invite-program-${program.id}`}
										checked={programIds.includes(program.id)}
										data-testid={`invite-program-${program.id}`}
										onCheckedChange={(next) =>
											toggleProgram(program.id, next === true)
										}
									/>
									<Label
										htmlFor={`invite-program-${program.id}`}
										className="font-normal"
									>
										{program.title}
									</Label>
								</div>
							))}
						</div>
					)}
				</div>

				{error ? (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				) : null}

				{created ? (
					<div
						className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3"
						data-testid="invite-created"
					>
						<p className="text-sm font-medium">Ссылка создана</p>
						<code
							className="break-all text-xs text-muted-foreground"
							data-testid="invite-created-url"
						>
							{created.url}
						</code>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="w-fit"
							data-testid="invite-copy-link"
							onClick={() => {
								void handleCopy(created.url);
							}}
						>
							<CopyIcon />
							{copied ? "Скопировано" : "Копировать ссылку"}
						</Button>
					</div>
				) : null}

				<Button
					type="submit"
					disabled={isSubmitting || !programs || programs.length === 0}
					data-testid="invite-create-submit"
				>
					<PlusIcon />
					{isSubmitting ? "Создаём…" : "Создать приглашение"}
				</Button>
			</form>

			<section className="grid gap-3" data-testid="invites-list">
				<h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
					Недавние приглашения
				</h2>
				{invites === undefined ? (
					<p className="text-sm text-muted-foreground">Загрузка…</p>
				) : invites.length === 0 ? (
					<EmptyState
						icon={<LinkIcon />}
						title="Пока нет приглашений"
						description="Создайте одноразовую ссылку и отправьте её ученику."
					/>
				) : (
					<ul className="flex flex-col gap-2">
						{invites.map((invite) => {
							const url = inviteUrl(invite.token);
							const programTitles = (invite.programs ?? [])
								.map((link) => link.program?.title)
								.filter(Boolean)
								.join(", ");
							const used = invite.usedAt != null;
							return (
								<li
									key={invite.id}
									className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
									data-testid={`invite-row-${invite.id}`}
								>
									<div className="min-w-0">
										<p className="truncate font-medium">
											{invite.inviteeName || invite.inviteeEmail || "Без имени"}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{programTitles || "Без программ"}
											{" · "}
											{used
												? `использована ${formatDateTime(invite.usedAt)}`
												: `активна · до ${formatDateTime(invite.expiresAt)}`}
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										data-testid={`invite-copy-${invite.id}`}
										onClick={() => {
											void handleCopy(url);
										}}
									>
										<CopyIcon />
										Копировать
									</Button>
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</main>
	);
}
