import { useQuery, useZero } from "@rocicorp/zero/react";
import { useCallback, useMemo, useState } from "react";
import { PracticeRenderer } from "#/features/lesson-editor";
import { extractPracticeQuestions } from "#/features/lesson-editor/lib/extract-practice-questions";
import { uploadSubmissionFile } from "#/features/lesson-player/lib/upload-submission-file";
import type {
	GradedAnswers,
	QuestionResult,
	StudentAnswer,
	StudentAnswers,
} from "#/server/grading/grade-submission";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { StatusBadge } from "@/components/lms";
import { Button } from "@/components/ui/button";

type PracticeActivityProps = {
	programId: string;
	activityId: string;
	content: unknown;
};

function isGradedAnswers(value: unknown): value is GradedAnswers {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function resultsFromAnswers(
	answers: GradedAnswers,
): Record<string, QuestionResult> {
	const results: Record<string, QuestionResult> = {};
	for (const [questionId, answer] of Object.entries(answers)) {
		results[questionId] = answer.result;
	}
	return results;
}

function studentAnswersFromGraded(answers: GradedAnswers): StudentAnswers {
	const out: StudentAnswers = {};
	for (const [questionId, answer] of Object.entries(answers)) {
		const { result: _result, ...payload } = answer;
		out[questionId] = payload as StudentAnswer;
	}
	return out;
}

export function PracticeActivity({
	programId,
	activityId,
	content,
}: PracticeActivityProps) {
	const zero = useZero();
	const [submissions] = useQuery(
		queries.mySubmissionsByActivity({ activityId }),
	);
	const latest = submissions?.[0] ?? null;

	const questions = useMemo(() => extractPracticeQuestions(content), [content]);

	const [draftAnswers, setDraftAnswers] = useState<StudentAnswers>({});
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showForm, setShowForm] = useState(false);

	const hasSubmission = latest !== null;
	const viewingResult = hasSubmission && !showForm;

	const gradedAnswers = isGradedAnswers(latest?.answers)
		? latest.answers
		: null;
	const resultAnswers = gradedAnswers
		? studentAnswersFromGraded(gradedAnswers)
		: {};
	const results = gradedAnswers ? resultsFromAnswers(gradedAnswers) : undefined;

	const handleAnswerChange = useCallback(
		(questionId: string, answer: StudentAnswer | null) => {
			setDraftAnswers((current) => {
				const next = { ...current };
				if (answer === null) {
					delete next[questionId];
				} else {
					next[questionId] = answer;
				}
				return next;
			});
			setError(null);
		},
		[],
	);

	const handleUpload = useCallback(
		(
			file: File,
			ctx: { onProgress: (progress: number) => void; signal: AbortSignal },
		) => uploadSubmissionFile(file, ctx),
		[],
	);

	const handleSubmit = async () => {
		setError(null);
		for (const question of questions) {
			const answer = draftAnswers[question.questionId];
			if (!answer) {
				setError("Ответьте на все вопросы перед отправкой");
				return;
			}
			if (answer.type === "short_text" && answer.value.trim().length === 0) {
				setError("Заполните текстовые ответы");
				return;
			}
			if (answer.type === "single_choice" && answer.optionId.length === 0) {
				setError("Выберите вариант ответа");
				return;
			}
			if (
				answer.type === "file_upload" &&
				answer.storageKey.trim().length === 0
			) {
				setError("Дождитесь загрузки файлов");
				return;
			}
		}

		setIsSubmitting(true);
		try {
			await zero.mutate(
				mutators.submitPractice({
					programId,
					activityId,
					answers: draftAnswers,
				}),
			);
			setDraftAnswers({});
			setShowForm(false);
		} catch (cause) {
			const message =
				cause instanceof Error ? cause.message : "Не удалось отправить ответы";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section
			className="space-y-4"
			data-testid={`practice-activity-${activityId}`}
		>
			{latest ? (
				<div
					className="space-y-2 rounded-xl border border-border bg-muted/20 px-4 py-3"
					data-testid={`practice-submission-status-${activityId}`}
				>
					<div className="flex flex-wrap items-center gap-2">
						<p className="text-sm font-medium">Последняя попытка</p>
						<StatusBadge
							status={latest.status === "graded" ? "graded" : "pending"}
							data-testid={`practice-submission-badge-${activityId}`}
						/>
					</div>
					{latest.reviewerComment ? (
						<p
							className="text-sm text-muted-foreground"
							data-testid={`practice-reviewer-comment-${activityId}`}
						>
							Комментарий преподавателя: {latest.reviewerComment}
						</p>
					) : null}
					{viewingResult ? (
						<div className="pt-1">
							<Button
								type="button"
								variant="outline"
								size="sm"
								data-testid={`practice-retry-${activityId}`}
								onClick={() => {
									setShowForm(true);
									setDraftAnswers({});
									setError(null);
								}}
							>
								Отправить заново
							</Button>
						</div>
					) : null}
				</div>
			) : null}

			<PracticeRenderer
				content={content}
				sanitize
				answering={{
					mode: viewingResult ? "readonly" : "answer",
					answers: viewingResult ? resultAnswers : draftAnswers,
					results: viewingResult ? results : undefined,
					onAnswerChange: viewingResult ? undefined : handleAnswerChange,
					uploadFile: viewingResult ? undefined : handleUpload,
					disabled: viewingResult || isSubmitting,
				}}
			/>

			{!viewingResult ? (
				<div className="flex flex-col gap-2 border-t border-border pt-4">
					{error ? (
						<p
							className="text-sm text-destructive"
							data-testid={`practice-submit-error-${activityId}`}
						>
							{error}
						</p>
					) : null}
					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							disabled={isSubmitting || questions.length === 0}
							data-testid={`practice-submit-${activityId}`}
							onClick={() => {
								void handleSubmit();
							}}
						>
							{isSubmitting ? "Отправка…" : "Отправить ответы"}
						</Button>
						{hasSubmission ? (
							<Button
								type="button"
								variant="ghost"
								disabled={isSubmitting}
								data-testid={`practice-cancel-retry-${activityId}`}
								onClick={() => {
									setShowForm(false);
									setDraftAnswers({});
									setError(null);
								}}
							>
								Отмена
							</Button>
						) : null}
					</div>
				</div>
			) : null}
		</section>
	);
}
