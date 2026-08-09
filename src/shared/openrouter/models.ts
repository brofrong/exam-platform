export type CuratedOpenRouterModel = {
	id: string;
	name: string;
	description: string;
};

export const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-sonnet-4.5";

/** Stable top chat models offered in admin settings (fallback if /models fails). */
export const CURATED_OPENROUTER_MODELS: readonly CuratedOpenRouterModel[] = [
	{
		id: "anthropic/claude-sonnet-4.5",
		name: "Claude Sonnet 4.5",
		description: "Баланс качества и скорости для авторства",
	},
	{
		id: "anthropic/claude-opus-4.5",
		name: "Claude Opus 4.5",
		description: "Максимальное качество рассуждений",
	},
	{
		id: "openai/gpt-5.1",
		name: "GPT-5.1",
		description: "Флагман OpenAI для длинного контента",
	},
	{
		id: "openai/gpt-4o",
		name: "GPT-4o",
		description: "Быстрая универсальная модель",
	},
	{
		id: "google/gemini-2.5-pro",
		name: "Gemini 2.5 Pro",
		description: "Сильный контекст и STEM",
	},
	{
		id: "google/gemini-2.5-flash",
		name: "Gemini 2.5 Flash",
		description: "Дешевле и быстрее для черновиков",
	},
	{
		id: "deepseek/deepseek-chat-v3.1",
		name: "DeepSeek V3.1",
		description: "Сильный чат при низкой цене",
	},
	{
		id: "deepseek/deepseek-r1",
		name: "DeepSeek R1",
		description: "Явное reasoning для сложных задач",
	},
];
