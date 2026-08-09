import {
	CURATED_OPENROUTER_MODELS,
	type CuratedOpenRouterModel,
	OPENROUTER_CHAT_URL,
	OPENROUTER_MODELS_URL,
} from "#/server/openrouter/constants";

export type OpenRouterModelOption = CuratedOpenRouterModel & {
	source: "curated" | "openrouter";
};

type OpenRouterModelsResponse = {
	data?: Array<{
		id?: string;
		name?: string;
		description?: string;
	}>;
};

export async function listOpenRouterModels(
	apiKey: string | null,
): Promise<OpenRouterModelOption[]> {
	const curated: OpenRouterModelOption[] = CURATED_OPENROUTER_MODELS.map(
		(model) => ({ ...model, source: "curated" as const }),
	);

	if (!apiKey) {
		return curated;
	}

	try {
		const response = await fetch(OPENROUTER_MODELS_URL, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});
		if (!response.ok) {
			return curated;
		}
		const json = (await response.json()) as OpenRouterModelsResponse;
		const remote = (json.data ?? [])
			.filter(
				(item): item is { id: string; name?: string; description?: string } =>
					typeof item.id === "string" && item.id.length > 0,
			)
			.slice(0, 40)
			.map((item) => ({
				id: item.id,
				name: item.name?.trim() || item.id,
				description: item.description?.trim() || "Модель OpenRouter",
				source: "openrouter" as const,
			}));

		const byId = new Map<string, OpenRouterModelOption>();
		for (const model of curated) {
			byId.set(model.id, model);
		}
		for (const model of remote) {
			if (!byId.has(model.id)) {
				byId.set(model.id, model);
			}
		}
		return [...byId.values()];
	} catch {
		return curated;
	}
}

export type ChatMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

export async function streamOpenRouterChat(input: {
	apiKey: string;
	model: string;
	messages: ChatMessage[];
}): Promise<Response> {
	const upstream = await fetch(OPENROUTER_CHAT_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${input.apiKey}`,
			"Content-Type": "application/json",
			"HTTP-Referer": "https://exam-platform.local",
			"X-Title": "Exam Platform Author Chat",
		},
		body: JSON.stringify({
			model: input.model,
			messages: input.messages,
			stream: true,
		}),
	});

	if (!upstream.ok || !upstream.body) {
		const text = await upstream.text().catch(() => "");
		return Response.json(
			{
				error:
					text.trim().length > 0
						? text.slice(0, 400)
						: `OpenRouter error (${upstream.status})`,
			},
			{ status: upstream.status >= 400 ? upstream.status : 502 },
		);
	}

	return new Response(upstream.body, {
		headers: {
			"Content-Type": "text/event-stream; charset=utf-8",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
		},
	});
}
