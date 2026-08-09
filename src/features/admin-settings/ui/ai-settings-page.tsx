import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CURATED_OPENROUTER_MODELS } from "#/shared/openrouter/models";
import { PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type AiSettings = {
	hasApiKey: boolean;
	apiKeyMasked: string | null;
	model: string;
};

type ModelOption = {
	id: string;
	name: string;
	description: string;
	source: "curated" | "openrouter";
};

export function AiSettingsPage() {
	const [settings, setSettings] = useState<AiSettings | null>(null);
	const [models, setModels] = useState<ModelOption[]>(
		CURATED_OPENROUTER_MODELS.map((model) => ({
			...model,
			source: "curated",
		})),
	);
	const [apiKeyDraft, setApiKeyDraft] = useState("");
	const [modelDraft, setModelDraft] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const load = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const [settingsRes, modelsRes] = await Promise.all([
				fetch("/api/admin/ai-settings"),
				fetch("/api/admin/openrouter-models"),
			]);
			if (!settingsRes.ok) {
				const payload = (await settingsRes.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(payload?.error ?? "Не удалось загрузить настройки");
			}
			const nextSettings = (await settingsRes.json()) as AiSettings;
			setSettings(nextSettings);
			setModelDraft(nextSettings.model);

			if (modelsRes.ok) {
				const payload = (await modelsRes.json()) as { models: ModelOption[] };
				if (payload.models.length > 0) {
					const hasCurrent = payload.models.some(
						(model) => model.id === nextSettings.model,
					);
					setModels(
						hasCurrent
							? payload.models
							: [
									{
										id: nextSettings.model,
										name: nextSettings.model,
										description: "Сохранённая модель",
										source: "openrouter",
									},
									...payload.models,
								],
					);
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка загрузки");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		if (isSaving) return;
		setIsSaving(true);
		setError(null);
		setMessage(null);
		try {
			const body: {
				model?: string;
				apiKey?: string;
				clearApiKey?: boolean;
			} = {};
			if (modelDraft.trim().length > 0) {
				body.model = modelDraft.trim();
			}
			if (apiKeyDraft.trim().length > 0) {
				body.apiKey = apiKeyDraft.trim();
			}
			const response = await fetch("/api/admin/ai-settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(payload?.error ?? "Не удалось сохранить");
			}
			const next = (await response.json()) as AiSettings;
			setSettings(next);
			setModelDraft(next.model);
			setApiKeyDraft("");
			setMessage("Настройки сохранены");
			void load();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка сохранения");
		} finally {
			setIsSaving(false);
		}
	};

	const handleClearKey = async () => {
		if (isSaving) return;
		setIsSaving(true);
		setError(null);
		setMessage(null);
		try {
			const response = await fetch("/api/admin/ai-settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ clearApiKey: true }),
			});
			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(payload?.error ?? "Не удалось удалить ключ");
			}
			const next = (await response.json()) as AiSettings;
			setSettings(next);
			setApiKeyDraft("");
			setMessage("Ключ OpenRouter удалён");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка удаления");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-ai-settings-page"
		>
			<PageHeader
				title="Настройки ИИ"
				description="Токен и модель OpenRouter для чата автора теории и тестов. Доступно только админам."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="ai-settings-admin-link"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">ИИ</span>
					</nav>
				}
			/>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Загрузка…</p>
			) : (
				<form
					onSubmit={(e) => void handleSave(e)}
					className="grid gap-6"
					data-testid="admin-ai-settings-form"
				>
					<div className="grid gap-2">
						<Label htmlFor="openrouter-api-key">Токен OpenRouter</Label>
						<p className="text-xs text-muted-foreground">
							{settings?.hasApiKey
								? `Сейчас сохранён: ${settings.apiKeyMasked}`
								: "Ключ ещё не задан — чат автора не заработает."}
						</p>
						<Input
							id="openrouter-api-key"
							type="password"
							autoComplete="off"
							placeholder="sk-or-v1-…"
							value={apiKeyDraft}
							onChange={(e) => setApiKeyDraft(e.target.value)}
							data-testid="openrouter-api-key-input"
						/>
						{settings?.hasApiKey ? (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="w-fit"
								disabled={isSaving}
								onClick={() => void handleClearKey()}
								data-testid="openrouter-api-key-clear"
							>
								Удалить ключ
							</Button>
						) : null}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="openrouter-model">Модель</Label>
						<Select value={modelDraft} onValueChange={setModelDraft}>
							<SelectTrigger
								id="openrouter-model"
								data-testid="openrouter-model-select"
							>
								<SelectValue placeholder="Выберите модель" />
							</SelectTrigger>
							<SelectContent>
								{models.map((model) => (
									<SelectItem key={model.id} value={model.id}>
										{model.name}
										{model.source === "curated" ? "" : ` (${model.id})`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">
							Сверху — рекомендованный топ. Если ключ задан, список дополняется
							моделями из OpenRouter.
						</p>
					</div>

					{error ? (
						<p
							className="text-sm text-destructive"
							data-testid="admin-ai-settings-error"
						>
							{error}
						</p>
					) : null}
					{message ? (
						<p
							className="text-sm text-muted-foreground"
							data-testid="admin-ai-settings-message"
						>
							{message}
						</p>
					) : null}

					<div className="flex flex-wrap gap-2">
						<Button
							type="submit"
							disabled={isSaving}
							data-testid="admin-ai-settings-submit"
						>
							{isSaving ? "Сохраняем…" : "Сохранить"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => void load()}
							data-testid="admin-ai-settings-refresh"
						>
							Обновить
						</Button>
					</div>
				</form>
			)}
		</main>
	);
}
