import type { Editor } from "@tiptap/react";
import { createContext, useContext } from "react";
import type { TheoryEditorApply } from "#/features/ai-author-chat/lib/apply-to-editor";

export type AiAuthorEditorBridge = {
	registerEditor: (editor: Editor | null) => void;
	apply: TheoryEditorApply | null;
};

const AiAuthorEditorBridgeContext = createContext<AiAuthorEditorBridge | null>(
	null,
);

export const AiAuthorEditorBridgeProvider =
	AiAuthorEditorBridgeContext.Provider;

export function useAiAuthorEditorBridge(): AiAuthorEditorBridge | null {
	return useContext(AiAuthorEditorBridgeContext);
}

export function useTheoryEditorApply(): TheoryEditorApply | null {
	return useContext(AiAuthorEditorBridgeContext)?.apply ?? null;
}
