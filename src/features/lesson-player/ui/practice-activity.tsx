import { useQuery, useZero } from "@rocicorp/zero/react";
import { useCallback, useMemo, useState } from "react";
import { TheoryRenderer } from "#/features/lesson-editor";
import { uploadSubmissionFile } from "#/features/lesson-player/lib/upload-submission-file";
import {
	isPracticeActivityContent,
	type PracticeActivityContent,
} from "#/server/db/activity/practice-content";
import type {
	GradedAnswer,
	QuestionResult,
	StudentAnswer,
	StudentAnswers,
} from "#/server/grading/grade-attempt";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import {
	type AnswerOption,
	FileUploadAnswer,
	MultipleChoiceAnswer,
	ShortTextAnswer,
	SingleChoiceAnswer,
} from "@/components/answer-widgets";
import { StatusBadge } from "@/components/lms";
import { Button } from "@/components/ui/button";

type PracticeActivityProps = {
	programId: string;
	activityId: string;
	content: unknown;
};

type TestRow = {
	id: string;
	answerType: string;
	options: AnswerOption[] | null;
	prompt: unknown;
	grading: string;
};

function sampleIds(ids: string[], count: number): string[] {
	const copy = [...ids];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const left = copy[i];
		const right = copy[j];
		if (left === undefined || right === undefined) {
			continue;
		}
		copy[i] = right;
		copy[j] = left;
	}
	return copy.slice(0, Math.min(count, copy.length));
}

function parseOptions(value: unknown): AnswerOption[] {
	if (!Array.isArray(value)) return [];
	const out: AnswerOption[] = [];
	for (const item of value) {
		if (
			item &&
			typeof item === "object" &&
			"id" in item &&
			"label" in item &&
			typeof (item as { id: unknown }).id === "string" &&
			typeof (item as { label: unknown }).label === "string"
		) {
			out.push({
				id: (item as { id: string }).id,
				label: (item as { label: string }).label,
			});
		}
	}
	return out;
}

function resultLabel(result: QuestionResult): string {
	if (result === "correct") return "Верно";
	if (result === "incorrect") return "Неверно";
	return "На проверке";
}

function TestAnswerWidget({
	test,
	answer,
	disabled,
	onChange,
}: {
	test: TestRow;
	answer: StudentAnswer | undefined;
	disabled: boolean;
	onChange: (answer: StudentAnswer | null) => void;
}) {
	const options = parseOptions(test.options);

	switch (test.answerType) {
		case "single_choice":
			return (
				<SingleChoiceAnswer
					options={options}
					value={answer?.type === "single_choice" ? answer.optionId : null}
					disabled={disabled}
					onChange={(optionId) =>
						onChange(optionId ? { type: "single_choice", optionId } : null)
					}
				/>
			);
		case "multiple_choice":
			return (
				<MultipleChoiceAnswer
					options={options}
					value={answer?.type === "multiple_choice" ? answer.optionIds : []}
					disabled={disabled}
					onChange={(optionIds) =>
						onChange(
							optionIds.length > 0
								? { type: "multiple_choice", optionIds }
								: null,
						)
					}
				/>
			);
		case "number":
			return (
				<ShortTextAnswer
					label="Числовой ответ"
					placeholder="Введите число"
					value={
						answer?.type === "number" || answer?.type === "short_text"
							? answer.value
							: ""
					}
					disabled={disabled}
					onChange={(value) =>
						onChange(value ? { type: "number", value } : null)
					}
				/>
			);
		case "file_upload":
			if (disabled && answer?.type === "file_upload") {
				return (
					<p className="text-sm">
						Файл: {answer.filename || "—"}
						{answer.size > 0 ? (
							<span className="ml-2 text-xs text-muted-foreground">
								({Math.max(1, Math.round(answer.size / 1024))} КБ)
							</span>
						) : null}
					</p>
				);
			}
			return (
				<FileUploadAnswer
					disabled={disabled}
					multiple={false}
					label="Файл ответа"
					onChange={(files) => {
						if (files.length === 0) {
							onChange(null);
						}
					}}
					onUpload={async (file, ctx) => {
						const uploaded = await uploadSubmissionFile(file, ctx);
						onChange({
							type: "file_upload",
							storageKey: uploaded.storageKey,
							filename: uploaded.filename,
							mime: uploaded.mime,
							size: uploaded.size,
						});
						return uploaded;
					}}
				/>
			);
		default:
			return (
				<ShortTextAnswer
					value={answer?.type === "short_text" ? answer.value : ""}
					disabled={disabled}
					onChange={(value) =>
						onChange(value ? { type: "short_text", value } : null)
					}
				/>
			);
	}
}

export function PracticeActivity({
	programId,
	activityId,
	content,
}: PracticeActivityProps) {
	const zero = useZero();
	const config: PracticeActivityContent | null = isPracticeActivityContent(
		content,
	)
		? content
		: null;

	const [attempts] = useQuery(queries.myAttemptsByActivity({ activityId }));
	const [groupTests] = useQuery(
		queries.testsByGroupId({
			groupId: config?.testGroupId || "__none__",
		}),
	);

	const latest = attempts?.[0] ?? null;
	const inProgress = latest?.status === "in_progress" ? latest : null;
	const latestFinished =
		latest && latest.status !== "in_progress" ? latest : null;

	const viewingAttempt = inProgress ?? latestFinished;

	const testIds = (viewingAttempt?.testIds as string[] | undefined) ?? [];
	const [tests] = useQuery(
		testIds.length > 0
			? queries.testsByIds({ ids: testIds })
			: queries.testsByIds({ ids: ["__none__"] }),
	);

	const orderedTests = useMemo(() => {
		const byId = new Map((tests ?? []).map((t) => [t.id, t]));
		return testIds
			.map((id) => byId.get(id))
			.filter((t): t is NonNullable<typeof t> => t != null)
			.map(
				(t): TestRow => ({
					id: t.id,
					answerType: t.answerType,
					options: parseOptions(t.options),
					prompt: t.prompt,
					grading: t.grading,
				}),
			);
	}, [tests, testIds]);

	const answerRows = viewingAttempt?.answers ?? [];
	const gradedByTest = useMemo(() => {
		const map = new Map<string, GradedAnswer>();
		for (const row of answerRows) {
			map.set(row.testId, row.answer as GradedAnswer);
		}
		return map;
	}, [answerRows]);

	const [draftAnswers, setDraftAnswers] = useState<StudentAnswers>({});
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const handleAnswerChange = useCallback(
		(testId: string, answer: StudentAnswer | null) => {
			setDraftAnswers((current) => {
				const next = { ...current };
				if (answer === null) {
					delete next[testId];
				} else {
					next[testId] = answer;
				}
				return next;
			});
		},
		[],
	);

	const startAttempt = async () => {
		if (!config || busy) return;
		const pool = (groupTests ?? []).map((t) => t.id);
		if (pool.length < config.questionCount) {
			setError("В группе недостаточно тестов");
			return;
		}
		setBusy(true);
		setError(null);
		setDraftAnswers({});
		try {
			const sampled = sampleIds(pool, config.questionCount);
			await zero.mutate(
				mutators.startTestAttempt({
					id: crypto.randomUUID(),
					programId,
					activityId,
					testIds: sampled,
				}),
			);
		} catch {
			setError("Не удалось начать попытку");
		} finally {
			setBusy(false);
		}
	};

	const submitAttempt = async () => {
		if (!inProgress || busy) return;
		setBusy(true);
		setError(null);
		try {
			await zero.mutate(
				mutators.submitTestAttempt({
					attemptId: inProgress.id,
					answers: draftAnswers,
				}),
			);
		} catch {
			setError("Не удалось отправить ответы");
		} finally {
			setBusy(false);
		}
	};

	if (!config || !config.testGroupId) {
		return (
			<section
				className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground"
				data-testid="practice-not-configured"
			>
				Практика ещё не настроена преподавателем.
			</section>
		);
	}

	const hasIncorrect =
		latestFinished != null &&
		answerRows.some((row) => row.result === "incorrect");
	const passed = latestFinished?.passed === true;
	const pendingReview = latestFinished?.status === "pending_review";

	return (
		<section className="grid gap-6" data-testid="practice-activity">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">
						Задач в попытке: {config.questionCount} · проходной балл{" "}
						{config.passPercent}%
					</p>
					{latestFinished ? (
						<div className="flex flex-wrap items-center gap-2">
							{pendingReview ? (
								<StatusBadge status="pending" />
							) : passed ? (
								<StatusBadge status="graded" label="Пройдено" />
							) : (
								<StatusBadge status="incorrect" label="Не пройдено" />
							)}
							{latestFinished.scorePercent != null ? (
								<span className="text-sm text-muted-foreground">
									Результат: {latestFinished.scorePercent}%
								</span>
							) : null}
						</div>
					) : null}
				</div>
				<div className="flex flex-wrap gap-2">
					{!inProgress ? (
						<Button
							data-testid="practice-start"
							disabled={busy}
							variant={hasIncorrect ? "default" : "outline"}
							onClick={() => void startAttempt()}
						>
							{latestFinished ? "Пройти заново" : "Начать"}
						</Button>
					) : null}
				</div>
			</div>

			{hasIncorrect && !inProgress ? (
				<p
					className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm"
					data-testid="practice-retry-hint"
				>
					Есть ошибки. Можно перегенерировать задачи и пройти тему ещё раз.
				</p>
			) : null}

			{inProgress && orderedTests.length > 0 ? (
				<div className="grid gap-8" data-testid="practice-attempt-form">
					{orderedTests.map((test, index) => (
						<article
							key={test.id}
							className="grid gap-3 border-b border-border/60 pb-6 last:border-0"
							data-testid={`practice-test-${test.id}`}
						>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Задача {index + 1}
							</p>
							<div className="prose prose-sm dark:prose-invert max-w-none">
								<TheoryRenderer content={test.prompt} />
							</div>
							<TestAnswerWidget
								test={test}
								answer={draftAnswers[test.id]}
								disabled={busy}
								onChange={(answer) => handleAnswerChange(test.id, answer)}
							/>
						</article>
					))}
					<div className="flex flex-wrap gap-2">
						<Button
							data-testid="practice-submit"
							disabled={busy}
							onClick={() => void submitAttempt()}
						>
							{busy ? "Отправляем…" : "Отправить"}
						</Button>
					</div>
				</div>
			) : null}

			{!inProgress && latestFinished && orderedTests.length > 0 ? (
				<div className="grid gap-6" data-testid="practice-attempt-result">
					{orderedTests.map((test, index) => {
						const graded = gradedByTest.get(test.id);
						const result = (graded?.result ?? "pending") as QuestionResult;
						const { result: _r, ...payload } = graded ?? {
							type: "short_text" as const,
							value: "",
							result: "pending" as const,
						};
						return (
							<article
								key={test.id}
								className="grid gap-3 border-b border-border/60 pb-6 last:border-0"
							>
								<div className="flex flex-wrap items-center gap-2">
									<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										Задача {index + 1}
									</p>
									<span className="text-sm">{resultLabel(result)}</span>
								</div>
								<div className="prose prose-sm dark:prose-invert max-w-none">
									<TheoryRenderer content={test.prompt} />
								</div>
								<TestAnswerWidget
									test={test}
									answer={payload as StudentAnswer}
									disabled
									onChange={() => {}}
								/>
							</article>
						);
					})}
				</div>
			) : null}

			{!viewingAttempt ? (
				<p className="text-sm text-muted-foreground">
					Нажмите «Начать», чтобы получить случайный набор задач из темы.
				</p>
			) : null}

			{error ? (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			) : null}
		</section>
	);
}
