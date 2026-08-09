import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TheoryRenderer } from "#/features/lesson-editor";
import type { GradedAnswer } from "#/server/grading/grade-attempt";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader, StatusBadge } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReviewDetailPageProps = {
	attemptId: string;
};

function formatAnswer(answer: GradedAnswer): string {
	switch (answer.type) {
		case "short_text":
		case "number":
			return answer.value || "—";
		case "single_choice":
			return answer.optionId || "—";
		case "multiple_choice":
			return answer.optionIds.length > 0 ? answer.optionIds.join(", ") : "—";
		case "file_upload":
			return `${answer.filename} (${Math.max(1, Math.round(answer.size / 1024))} КБ)`;
	}
}

export function ReviewDetailPage({ attemptId }: ReviewDetailPageProps) {
	const zero = useZero();
	const [attempt] = useQuery(queries.attemptById({ id: attemptId }));
	const testIds = (attempt?.testIds as string[] | undefined) ?? [];
	const [tests] = useQuery(
		testIds.length > 0
			? queries.testsByIds({ ids: testIds })
			: queries.testsByIds({ ids: ["__none__"] }),
	);
	const [draftResults, setDraftResults] = useState<
		Record<string, "correct" | "incorrect">
	>({});
	const [comment, setComment] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	const answerByTest = useMemo(() => {
		const map = new Map<string, GradedAnswer>();
		for (const row of attempt?.answers ?? []) {
			map.set(row.testId, row.answer as GradedAnswer);
		}
		return map;
	}, [attempt?.answers]);

	const pendingTestIds = useMemo(() => {
		return [...answerByTest.entries()]
			.filter(([, answer]) => answer.result === "pending")
			.map(([testId]) => testId);
	}, [answerByTest]);

	const orderedTests = useMemo(() => {
		const byId = new Map((tests ?? []).map((t) => [t.id, t]));
		return testIds
			.map((id) => byId.get(id))
			.filter((t): t is NonNullable<typeof t> => t != null);
	}, [tests, testIds]);

	if (attempt === undefined) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка работы…</p>
			</main>
		);
	}

	if (attempt === null) {
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="admin-review-missing"
			>
				<EmptyState
					title="Работа не найдена"
					description="Возможно, её уже проверили или удалили."
					action={
						<Button asChild>
							<Link to="/admin/reviews">К очереди</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		if (isSaving) return;
		const results = { ...draftResults };
		for (const testId of pendingTestIds) {
			if (!results[testId]) {
				setError("Отметьте верно/неверно для всех ответов на проверке");
				return;
			}
		}
		setIsSaving(true);
		setError(null);
		try {
			await zero.mutate(
				mutators.reviewAttempt({
					attemptId,
					results,
					comment: comment.trim() ? comment.trim() : null,
				}),
			);
			setSaved(true);
		} catch {
			setError("Не удалось сохранить проверку");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-review-detail"
		>
			<PageHeader
				title="Проверка попытки"
				description={[attempt.user?.name, attempt.program?.title]
					.filter(Boolean)
					.join(" · ")}
				breadcrumbs={
					<nav className="text-sm">
						<Link to="/admin/reviews" className="hover:text-foreground">
							Проверка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Попытка</span>
					</nav>
				}
				actions={
					attempt.status === "pending_review" ? (
						<StatusBadge status="pending" />
					) : (
						<StatusBadge status="graded" />
					)
				}
			/>

			<form className="grid gap-6" onSubmit={(e) => void handleSave(e)}>
				{orderedTests.map((test, index) => {
					const answer = answerByTest.get(test.id);
					if (!answer) return null;
					const isPending = answer.result === "pending";
					return (
						<article
							key={test.id}
							className="grid gap-3 rounded-xl border p-4"
							data-testid={`review-test-${test.id}`}
						>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Задача {index + 1}
							</p>
							<div className="prose prose-sm dark:prose-invert max-w-none">
								<TheoryRenderer content={test.prompt} />
							</div>
							<p className="text-sm">
								<span className="text-muted-foreground">Ответ: </span>
								{formatAnswer(answer)}
							</p>
							{isPending ? (
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										size="sm"
										variant={
											draftResults[test.id] === "correct"
												? "default"
												: "outline"
										}
										data-testid={`review-correct-${test.id}`}
										onClick={() =>
											setDraftResults((current) => ({
												...current,
												[test.id]: "correct",
											}))
										}
									>
										Верно
									</Button>
									<Button
										type="button"
										size="sm"
										variant={
											draftResults[test.id] === "incorrect"
												? "destructive"
												: "outline"
										}
										data-testid={`review-incorrect-${test.id}`}
										onClick={() =>
											setDraftResults((current) => ({
												...current,
												[test.id]: "incorrect",
											}))
										}
									>
										Неверно
									</Button>
								</div>
							) : (
								<StatusBadge
									status={answer.result === "correct" ? "correct" : "incorrect"}
								/>
							)}
						</article>
					);
				})}

				<div className="grid gap-2">
					<Label htmlFor="review-comment">Комментарий (опционально)</Label>
					<Textarea
						id="review-comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						data-testid="review-comment"
					/>
				</div>

				{error ? <p className="text-sm text-destructive">{error}</p> : null}
				{saved ? (
					<p className="text-sm text-emerald-600">Проверка сохранена</p>
				) : null}

				<div className="flex flex-wrap gap-2">
					<Button asChild variant="outline">
						<Link to="/admin/reviews">К очереди</Link>
					</Button>
					{attempt.status === "pending_review" ? (
						<Button
							type="submit"
							disabled={isSaving}
							data-testid="review-submit"
						>
							{isSaving ? "Сохраняем…" : "Сохранить проверку"}
						</Button>
					) : null}
				</div>
			</form>
		</main>
	);
}
