import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { extractPracticeQuestions } from "#/features/lesson-editor/lib/extract-practice-questions";
import type {
	GradedAnswer,
	GradedAnswers,
} from "#/server/grading/grade-submission";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader, StatusBadge } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReviewDetailPageProps = {
	submissionId: string;
};

function isGradedAnswers(value: unknown): value is GradedAnswers {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function formatAnswer(answer: GradedAnswer): string {
	switch (answer.type) {
		case "short_text":
			return answer.value || "—";
		case "single_choice":
			return answer.optionId || "—";
		case "multiple_choice":
			return answer.optionIds.length > 0 ? answer.optionIds.join(", ") : "—";
		case "file_upload":
			return `${answer.filename} (${Math.max(1, Math.round(answer.size / 1024))} КБ)`;
	}
}

export function ReviewDetailPage({ submissionId }: ReviewDetailPageProps) {
	const zero = useZero();
	const [submission] = useQuery(queries.submissionById({ id: submissionId }));
	const [draftResults, setDraftResults] = useState<
		Record<string, "correct" | "incorrect">
	>({});
	const [comment, setComment] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	const answers = isGradedAnswers(submission?.answers)
		? submission.answers
		: null;

	const questions = useMemo(
		() => extractPracticeQuestions(submission?.activity?.content),
		[submission?.activity?.content],
	);

	const pendingQuestionIds = useMemo(() => {
		if (!answers) {
			return [];
		}
		return Object.entries(answers)
			.filter(([, answer]) => answer.result === "pending")
			.map(([questionId]) => questionId);
	}, [answers]);

	if (submission === undefined) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка работы…</p>
			</main>
		);
	}

	if (submission === null) {
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="admin-review-missing"
			>
				<EmptyState
					title="Работа не найдена"
					description="Возможно, она уже проверена или удалена."
					action={
						<Button asChild data-testid="review-missing-back">
							<Link to="/admin/reviews">К очереди</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const setResult = (questionId: string, result: "correct" | "incorrect") => {
		setDraftResults((current) => ({ ...current, [questionId]: result }));
		setSaved(false);
		setError(null);
	};

	const handleSubmit = async () => {
		const missing = pendingQuestionIds.filter((id) => !draftResults[id]);
		if (missing.length > 0) {
			setError("Оцените все вопросы со статусом «На проверке»");
			return;
		}

		setIsSaving(true);
		setError(null);
		try {
			await zero.mutate(
				mutators.reviewSubmission({
					submissionId,
					results: draftResults,
					comment: comment.trim().length > 0 ? comment.trim() : null,
				}),
			);
			setSaved(true);
		} catch (cause) {
			const message =
				cause instanceof Error ? cause.message : "Не удалось сохранить оценку";
			setError(message);
		} finally {
			setIsSaving(false);
		}
	};

	const alreadyGraded = submission.status === "graded";

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-review-detail"
		>
			<PageHeader
				title="Проверка ответа"
				description={[
					submission.user?.name ?? "Ученик",
					submission.program?.title,
				]
					.filter(Boolean)
					.join(" · ")}
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="review-detail-admin-link"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<Link
							to="/admin/reviews"
							className="hover:text-foreground"
							data-testid="review-detail-queue-link"
						>
							Проверка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Работа</span>
					</nav>
				}
				actions={
					<StatusBadge
						status={submission.status === "graded" ? "graded" : "pending"}
						data-testid="review-detail-status"
					/>
				}
			/>

			<ol className="flex flex-col gap-4" data-testid="review-questions">
				{(questions.length > 0
					? questions
					: Object.keys(answers ?? {}).map((questionId) => ({
							questionId,
							prompt: questionId,
							nodeType: "shortTextQuestion" as const,
							options: [],
							grading: "manual" as const,
						}))
				).map((question) => {
					const answer = answers?.[question.questionId];
					if (!answer) {
						return null;
					}
					const draft = draftResults[question.questionId];
					const displayResult: "correct" | "incorrect" | "pending" =
						draft ?? answer.result;
					const optionLabel =
						answer.type === "single_choice"
							? (question.options.find((o) => o.id === answer.optionId)
									?.label ?? answer.optionId)
							: answer.type === "multiple_choice"
								? answer.optionIds
										.map(
											(id) =>
												question.options.find((o) => o.id === id)?.label ?? id,
										)
										.join(", ")
								: formatAnswer(answer);

					return (
						<li
							key={question.questionId}
							className="space-y-3 rounded-xl border border-border px-4 py-3"
							data-testid={`review-question-${question.questionId}`}
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div className="min-w-0 space-y-1">
									<p className="text-sm font-medium">{question.prompt}</p>
									<p className="text-sm text-muted-foreground">
										Ответ:{" "}
										<span className="text-foreground">{optionLabel}</span>
									</p>
								</div>
								<StatusBadge
									status={
										displayResult === "correct" || displayResult === "incorrect"
											? displayResult
											: "pending"
									}
									data-testid={`review-question-result-${question.questionId}`}
								/>
							</div>

							{answer.result === "pending" && !alreadyGraded ? (
								<div
									className="flex flex-wrap gap-2"
									data-testid={`review-grade-actions-${question.questionId}`}
								>
									<Button
										type="button"
										size="sm"
										variant={draft === "correct" ? "default" : "outline"}
										data-testid={`review-mark-correct-${question.questionId}`}
										onClick={() => setResult(question.questionId, "correct")}
									>
										Верно
									</Button>
									<Button
										type="button"
										size="sm"
										variant={draft === "incorrect" ? "destructive" : "outline"}
										data-testid={`review-mark-incorrect-${question.questionId}`}
										onClick={() => setResult(question.questionId, "incorrect")}
									>
										Неверно
									</Button>
								</div>
							) : null}
						</li>
					);
				})}
			</ol>

			{!alreadyGraded && pendingQuestionIds.length > 0 ? (
				<div className="space-y-3 border-t border-border pt-4">
					<div className="space-y-1.5">
						<Label htmlFor="reviewer-comment">Комментарий ученику</Label>
						<Textarea
							id="reviewer-comment"
							value={comment}
							rows={3}
							placeholder="Необязательно"
							data-testid="review-comment-input"
							onChange={(event) => {
								setComment(event.target.value);
								setSaved(false);
							}}
						/>
					</div>
					{error ? (
						<p
							className="text-sm text-destructive"
							data-testid="review-save-error"
						>
							{error}
						</p>
					) : null}
					{saved ? (
						<p
							className="text-sm text-muted-foreground"
							data-testid="review-save-success"
						>
							Оценка сохранена
						</p>
					) : null}
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							disabled={isSaving}
							data-testid="review-save"
							onClick={() => {
								void handleSubmit();
							}}
						>
							{isSaving ? "Сохранение…" : "Сохранить оценку"}
						</Button>
						<Button asChild variant="outline" data-testid="review-back-queue">
							<Link to="/admin/reviews">К очереди</Link>
						</Button>
					</div>
				</div>
			) : (
				<div className="border-t border-border pt-4">
					{submission.reviewerComment ? (
						<p
							className="mb-3 text-sm text-muted-foreground"
							data-testid="review-existing-comment"
						>
							Комментарий: {submission.reviewerComment}
						</p>
					) : null}
					<Button asChild variant="outline" data-testid="review-back-queue">
						<Link to="/admin/reviews">К очереди</Link>
					</Button>
				</div>
			)}
		</main>
	);
}
