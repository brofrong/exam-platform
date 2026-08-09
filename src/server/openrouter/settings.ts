import { eq } from "drizzle-orm";
import { db } from "#/server/db/db";
import { appSettingsTable } from "#/server/db/setting/setting.schema";
import {
	DEFAULT_OPENROUTER_MODEL,
	OPENROUTER_API_KEY_SETTING,
	OPENROUTER_MODEL_SETTING,
} from "#/server/openrouter/constants";

export async function getAppSetting(key: string): Promise<string | null> {
	const rows = await db
		.select({ value: appSettingsTable.value })
		.from(appSettingsTable)
		.where(eq(appSettingsTable.key, key))
		.limit(1);
	return rows[0]?.value ?? null;
}

export async function setAppSetting(key: string, value: string): Promise<void> {
	await db
		.insert(appSettingsTable)
		.values({ key, value })
		.onConflictDoUpdate({
			target: appSettingsTable.key,
			set: { value, updatedAt: new Date() },
		});
}

export async function deleteAppSetting(key: string): Promise<void> {
	await db.delete(appSettingsTable).where(eq(appSettingsTable.key, key));
}

export function maskApiKey(key: string): string {
	const trimmed = key.trim();
	if (trimmed.length === 0) {
		return "";
	}
	if (trimmed.length <= 10) {
		return "••••••••";
	}
	return `${trimmed.slice(0, 7)}…${trimmed.slice(-4)}`;
}

export async function getOpenRouterApiKey(): Promise<string | null> {
	const value = await getAppSetting(OPENROUTER_API_KEY_SETTING);
	const trimmed = value?.trim() ?? "";
	return trimmed.length > 0 ? trimmed : null;
}

export async function getOpenRouterModel(): Promise<string> {
	const value = await getAppSetting(OPENROUTER_MODEL_SETTING);
	const trimmed = value?.trim() ?? "";
	return trimmed.length > 0 ? trimmed : DEFAULT_OPENROUTER_MODEL;
}

export type AiSettingsPublic = {
	hasApiKey: boolean;
	apiKeyMasked: string | null;
	model: string;
};

export async function getAiSettingsPublic(): Promise<AiSettingsPublic> {
	const apiKey = await getOpenRouterApiKey();
	const model = await getOpenRouterModel();
	return {
		hasApiKey: apiKey != null,
		apiKeyMasked: apiKey ? maskApiKey(apiKey) : null,
		model,
	};
}

export async function saveAiSettings(input: {
	apiKey?: string | null;
	clearApiKey?: boolean;
	model?: string;
}): Promise<AiSettingsPublic> {
	if (input.clearApiKey) {
		await deleteAppSetting(OPENROUTER_API_KEY_SETTING);
	} else if (typeof input.apiKey === "string") {
		const trimmed = input.apiKey.trim();
		if (trimmed.length > 0) {
			await setAppSetting(OPENROUTER_API_KEY_SETTING, trimmed);
		}
	}

	if (typeof input.model === "string") {
		const model = input.model.trim();
		if (model.length > 0) {
			await setAppSetting(OPENROUTER_MODEL_SETTING, model);
		}
	}

	return getAiSettingsPublic();
}
