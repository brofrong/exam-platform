import { createContext, type ReactNode, useContext } from "react";
import type {
	QuestionResult,
	StudentAnswer,
	StudentAnswers,
} from "#/server/grading/grade-submission";

export type PracticeAnsweringMode = "preview" | "answer" | "readonly";

export type PracticeAnswerContextValue = {
	mode: PracticeAnsweringMode;
	answers: StudentAnswers;
	results?: Record<string, QuestionResult>;
	disabled?: boolean;
	setAnswer: (questionId: string, answer: StudentAnswer | null) => void;
	uploadFile?: (
		file: File,
		ctx: { onProgress: (progress: number) => void; signal: AbortSignal },
	) => Promise<{
		storageKey: string;
		filename: string;
		mime: string;
		size: number;
	}>;
};

const PracticeAnswerContext = createContext<PracticeAnswerContextValue | null>(
	null,
);

export function PracticeAnswerProvider({
	value,
	children,
}: {
	value: PracticeAnswerContextValue;
	children: ReactNode;
}) {
	return (
		<PracticeAnswerContext.Provider value={value}>
			{children}
		</PracticeAnswerContext.Provider>
	);
}

export function usePracticeAnswerContext(): PracticeAnswerContextValue | null {
	return useContext(PracticeAnswerContext);
}
