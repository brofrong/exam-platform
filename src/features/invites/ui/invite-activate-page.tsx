import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ActivateResponse = {
	ok?: boolean;
	soft?: boolean;
	error?: string;
	code?: string;
};

type InviteActivatePageProps = {
	token: string;
};

export function InviteActivatePage({ token }: InviteActivatePageProps) {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<"activating" | "error">("activating");

	useEffect(() => {
		let cancelled = false;

		void (async () => {
			try {
				const response = await fetch("/api/invite/activate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ token }),
				});
				const data = (await response.json()) as ActivateResponse;

				if (cancelled) {
					return;
				}

				if (response.ok) {
					await navigate({ to: "/app" });
					return;
				}

				setStatus("error");
				setError(data.error ?? "Не удалось активировать ссылку");
			} catch {
				if (!cancelled) {
					setStatus("error");
					setError("Не удалось активировать ссылку");
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [navigate, token]);

	return (
		<main
			className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-10 text-center"
			data-testid="invite-activate-page"
		>
			{status === "activating" ? (
				<>
					<h1 className="text-2xl font-bold">Активация доступа</h1>
					<p className="text-sm text-muted-foreground">
						Проверяем ссылку и записываем вас на программы…
					</p>
				</>
			) : (
				<>
					<h1 className="text-2xl font-bold">Не удалось активировать</h1>
					<p
						className="text-sm text-destructive"
						role="alert"
						data-testid="invite-activate-error"
					>
						{error}
					</p>
					<Button asChild variant="outline" data-testid="invite-go-app">
						<Link to="/app">На главную</Link>
					</Button>
				</>
			)}
		</main>
	);
}
