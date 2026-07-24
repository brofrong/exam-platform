import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getCurrentUser } from "#/server/auth/get-current-user";
import { authClient } from "#/shared/auth-client";

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
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const result =
				mode === "signup"
					? await authClient.signUp.email({ email, password, name })
					: await authClient.signIn.email({ email, password });

			if (result.error) {
				setError(result.error.message ?? "Не удалось выполнить вход");
				return;
			}

			await navigate({ to: "/" });
		} catch {
			setError("Не удалось выполнить вход");
		} finally {
			setIsSubmitting(false);
		}
	};

	const canSubmit =
		email.trim().length > 0 &&
		password.length > 0 &&
		(mode === "signin" || name.trim().length > 0);

	return (
		<main className="page-wrap flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
			<div className="w-full max-w-md rounded-2xl border border-border bg-bg-surface p-8 shadow-lg">
				<h1 className="text-2xl font-bold text-text-heading">
					{mode === "signin" ? "Вход в чат" : "Регистрация"}
				</h1>
				<p className="mt-2 text-sm text-text-muted">
					{mode === "signin"
						? "Войдите с email и паролем."
						: "Создайте аккаунт с именем, email и паролем."}
				</p>

				<div className="mt-4 flex rounded-xl border border-border p-1">
					<button
						type="button"
						data-testid="auth-mode-signin"
						onClick={() => {
							setMode("signin");
							setError(null);
						}}
						className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
							mode === "signin"
								? "bg-brand text-brand-foreground"
								: "text-text-muted hover:text-text-heading"
						}`}
					>
						Войти
					</button>
					<button
						type="button"
						data-testid="auth-mode-signup"
						onClick={() => {
							setMode("signup");
							setError(null);
						}}
						className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
							mode === "signup"
								? "bg-brand text-brand-foreground"
								: "text-text-muted hover:text-text-heading"
						}`}
					>
						Регистрация
					</button>
				</div>

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					{mode === "signup" && (
						<div>
							<label
								htmlFor="name"
								className="mb-1 block text-sm font-medium text-text-heading"
							>
								Имя
							</label>
							<input
								id="name"
								data-testid="auth-name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="например, Alice"
								className="w-full rounded-xl border border-border bg-bg-page px-4 py-2.5 text-sm outline-none focus:border-border-focus"
								required
							/>
						</div>
					)}

					<div>
						<label
							htmlFor="email"
							className="mb-1 block text-sm font-medium text-text-heading"
						>
							Email
						</label>
						<input
							id="email"
							data-testid="auth-email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="you@example.com"
							className="w-full rounded-xl border border-border bg-bg-page px-4 py-2.5 text-sm outline-none focus:border-border-focus"
							required
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="mb-1 block text-sm font-medium text-text-heading"
						>
							Пароль
						</label>
						<input
							id="password"
							data-testid="auth-password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="••••••••"
							className="w-full rounded-xl border border-border bg-bg-page px-4 py-2.5 text-sm outline-none focus:border-border-focus"
							required
							minLength={8}
						/>
					</div>

					{error && <p className="text-sm text-error">{error}</p>}

					<button
						type="submit"
						data-testid="auth-submit"
						disabled={isSubmitting || !canSubmit}
						className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-50"
					>
						{isSubmitting
							? mode === "signin"
								? "Входим..."
								: "Регистрируем..."
							: mode === "signin"
								? "Войти"
								: "Зарегистрироваться"}
					</button>
				</form>
			</div>
		</main>
	);
}
