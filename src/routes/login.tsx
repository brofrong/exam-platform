import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getCurrentUser } from "#/server/auth/get-current-user";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const user = await getCurrentUser();
		if (user) {
			throw redirect({ to: "/" });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const [login, setLogin] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ login }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				setError(data?.error ?? "Не удалось войти");
				return;
			}

			await navigate({ to: "/" });
		} catch {
			setError("Не удалось войти");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="page-wrap flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
			<div className="w-full max-w-md rounded-2xl border border-border bg-bg-surface p-8 shadow-lg">
				<h1 className="text-2xl font-bold text-text-heading">Вход в чат</h1>
				<p className="mt-2 text-sm text-text-muted">
					Введите логин. Если пользователя нет — он будет создан автоматически.
				</p>

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					<div>
						<label
							htmlFor="login"
							className="mb-1 block text-sm font-medium text-text-heading"
						>
							Логин
						</label>
						<input
							id="login"
							value={login}
							onChange={(event) => setLogin(event.target.value)}
							placeholder="например, alice"
							className="w-full rounded-xl border border-border bg-bg-page px-4 py-2.5 text-sm outline-none focus:border-border-focus"
							autoFocus
							required
						/>
					</div>

					{error && (
						<p className="text-sm text-error">{error}</p>
					)}

					<button
						type="submit"
						disabled={isSubmitting || !login.trim()}
						className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-50"
					>
						{isSubmitting ? "Входим..." : "Войти"}
					</button>
				</form>
			</div>
		</main>
	);
}
