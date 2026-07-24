import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/shared/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
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
				setError(result.error.message ?? "Не удалось войти");
				return;
			}

			await navigate({ to: "/" });
		} catch {
			setError("Не удалось войти");
		} finally {
			setIsSubmitting(false);
		}
	};

	const canSubmit =
		email.trim().length > 0 &&
		password.length > 0 &&
		(mode === "signin" || name.trim().length > 0);

	return (
		<main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center px-4 py-10">
			<div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-lg">
				<h1 className="text-2xl font-bold text-foreground">
					{mode === "signin" ? "Вход" : "Регистрация"}
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					{mode === "signin"
						? "Войдите с помощью email и пароля."
						: "Создайте аккаунт: укажите имя, email и пароль."}
				</p>

				<div className="mt-4 flex rounded-xl border border-border p-1">
					<Button
						type="button"
						variant={mode === "signin" ? "default" : "ghost"}
						data-testid="auth-mode-signin"
						onClick={() => {
							setMode("signin");
							setError(null);
						}}
						className="flex-1"
					>
						Вход
					</Button>
					<Button
						type="button"
						variant={mode === "signup" ? "default" : "ghost"}
						data-testid="auth-mode-signup"
						onClick={() => {
							setMode("signup");
							setError(null);
						}}
						className="flex-1"
					>
						Регистрация
					</Button>
				</div>

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					{mode === "signup" && (
						<div className="space-y-1.5">
							<label
								htmlFor="name"
								className="block text-sm font-medium text-foreground"
							>
								Имя
							</label>
							<Input
								id="name"
								data-testid="auth-name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="например, Анна"
								className="h-10 rounded-xl px-4"
								required
							/>
						</div>
					)}

					<div className="space-y-1.5">
						<label
							htmlFor="email"
							className="block text-sm font-medium text-foreground"
						>
							Email
						</label>
						<Input
							id="email"
							data-testid="auth-email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="you@example.com"
							className="h-10 rounded-xl px-4"
							required
						/>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="password"
							className="block text-sm font-medium text-foreground"
						>
							Пароль
						</label>
						<Input
							id="password"
							data-testid="auth-password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="••••••••"
							className="h-10 rounded-xl px-4"
							required
							minLength={8}
						/>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}

					<Button
						type="submit"
						data-testid="auth-submit"
						disabled={isSubmitting || !canSubmit}
						className="h-10 w-full rounded-xl"
						size="lg"
					>
						{isSubmitting
							? mode === "signin"
								? "Входим..."
								: "Создаём аккаунт..."
							: mode === "signin"
								? "Войти"
								: "Создать аккаунт"}
					</Button>
				</form>
			</div>
		</main>
	);
}
