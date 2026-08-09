export type ChatMode = "theory" | "test";

export type AuthorChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
};

export type AuthorChatRequest = {
	mode: ChatMode;
	title?: string;
	documentJson?: string;
	messages: Array<{
		role: "user" | "assistant";
		content: string;
	}>;
};

export const MAX_DOCUMENT_JSON_CHARS = 12_000;
