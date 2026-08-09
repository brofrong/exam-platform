import { createFileRoute } from "@tanstack/react-router";
import {
	type AuthorChatRequest,
	MAX_DOCUMENT_JSON_CHARS,
} from "#/features/ai-author-chat/lib/chat-types";
import { buildMasterPrompt } from "#/features/ai-author-chat/lib/master-prompt";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import {
	type ChatMessage,
	streamOpenRouterChat,
} from "#/server/openrouter/client";
import {
	getOpenRouterApiKey,
	getOpenRouterModel,
} from "#/server/openrouter/settings";
import { can } from "#/shared/authz";

function isChatMode(value: unknown): value is AuthorChatRequest["mode"] {
	return value === "theory" || value === "test";
}

export const Route = createFileRoute("/api/ai/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}
				if (!can(user.role, "lesson:write")) {
					return Response.json({ error: "Forbidden" }, { status: 403 });
				}

				const apiKey = await getOpenRouterApiKey();
				if (!apiKey) {
					return Response.json(
						{
							error:
								"OpenRouter не настроен. Админ должен указать токен в /admin/settings.",
						},
						{ status: 503 },
					);
				}

				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return Response.json({ error: "Invalid JSON" }, { status: 400 });
				}

				const record =
					body && typeof body === "object"
						? (body as Record<string, unknown>)
						: {};
				if (!isChatMode(record.mode)) {
					return Response.json(
						{ error: "mode must be theory or test" },
						{ status: 400 },
					);
				}

				const rawMessages = Array.isArray(record.messages)
					? record.messages
					: [];
				const messages: ChatMessage[] = [];
				for (const item of rawMessages) {
					if (!item || typeof item !== "object") continue;
					const row = item as Record<string, unknown>;
					if (
						(row.role === "user" || row.role === "assistant") &&
						typeof row.content === "string" &&
						row.content.trim().length > 0
					) {
						messages.push({
							role: row.role,
							content: row.content.slice(0, 20_000),
						});
					}
				}

				if (messages.length === 0) {
					return Response.json(
						{ error: "messages must not be empty" },
						{ status: 400 },
					);
				}

				const title =
					typeof record.title === "string" ? record.title.trim() : "";
				let documentJson =
					typeof record.documentJson === "string" ? record.documentJson : "";
				if (documentJson.length > MAX_DOCUMENT_JSON_CHARS) {
					documentJson = `${documentJson.slice(0, MAX_DOCUMENT_JSON_CHARS)}\n…[truncated]`;
				}

				const systemParts = [buildMasterPrompt(record.mode)];
				if (title) {
					systemParts.push(`Заголовок текущей активности/вопроса: ${title}`);
				}
				if (documentJson.trim().length > 0) {
					systemParts.push(
						`Текущий документ редактора (TipTap JSON, может быть неполным):\n${documentJson}`,
					);
				}

				const model = await getOpenRouterModel();
				return streamOpenRouterChat({
					apiKey,
					model,
					messages: [
						{ role: "system", content: systemParts.join("\n\n") },
						...messages,
					],
				});
			},
		},
	},
});
