import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
	ANSWER_TYPE_LABELS,
	GRADING_LABELS,
	requiresOptions,
	supportsCorrectAnswer,
} from "#/features/admin-tests/lib/test-labels";
import { computeTestStats } from "#/features/admin-tests/lib/test-stats";
import { TestOptionsEditor } from "#/features/admin-tests/ui/test-options-editor";
import {
	emptyTheoryDoc,
	normalizeTheoryDoc,
	type TheoryDoc,
	TheoryEditor,
	toActivityContent,
} from "#/features/lesson-editor";
import {
	TEST_ANSWER_TYPES,
	TEST_GRADING,
	type TestAnswerType,
	type TestGrading,
} from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import type { AnswerOption } from "@/components/answer-widgets";
import {
	MultipleChoiceAnswer,
	ShortTextAnswer,
	SingleChoiceAnswer,
} from "@/components/answer-widgets";
import { EmptyState, PageHeader, StatCard } from "@/components/lms";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type TestEditPageProps = {
	groupId: string;
	testId: string;
};

/** TipTap JSON document — must be JSON-serializable for the Zero mutator arg. */
const promptContentSchema = z.record(z.string(), z.json());

function emptyOptions(): AnswerOption[] {
	return [
		{ id: crypto.randomUUID(), label: "" },
		{ id: crypto.randomUUID(), label: "" },
	];
}

export function TestEditPage({ groupId, testId }: TestEditPageProps) {
	const zero = useZero();
	const navigate = useNavigate();
	const [test] = useQuery(queries.testById({ id: testId }));

	const [promptDraft, setPromptDraft] = useState<TheoryDoc>(emptyTheoryDoc);
	const [answerType, setAnswerType] = useState<TestAnswerType>(
		TEST_ANSWER_TYPES[0],
	);
	const [options, setOptions] = useState<AnswerOption[]>(emptyOptions);
	const [correctSingle, setCorrectSingle] = useState<string | null>(null);
	const [correctMultiple, setCorrectMultiple] = useState<string[]>([]);
	const [correctText, setCorrectText] = useState("");
	const [grading, setGrading] = useState<TestGrading>("auto");
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [hydratedId, setHydratedId] = useState<string | null>(null);

	useEffect(() => {
		if (!test || hydratedId === test.id) {
			return;
		}
		setPromptDraft(normalizeTheoryDoc(test.prompt));
		setAnswerType(test.answerType as TestAnswerType);
		setOptions(
			test.options && test.options.length > 0 ? test.options : emptyOptions(),
		);
		const correctAnswer = test.key?.correctAnswer ?? null;
		if (test.answerType === "single_choice") {
			setCorrectSingle(
				typeof correctAnswer === "string" ? correctAnswer : null,
			);
		} else if (test.answerType === "multiple_choice") {
			setCorrectMultiple(Array.isArray(correctAnswer) ? correctAnswer : []);
		} else if (
			test.answerType === "short_text" ||
			test.answerType === "number"
		) {
			setCorrectText(typeof correctAnswer === "string" ? correctAnswer : "");
		}
		setGrading((test.grading as TestGrading) ?? "auto");
		setSaveError(null);
		setIsSaving(false);
		setHydratedId(test.id);
	}, [test, hydratedId]);

	const backToGroup = async () => {
		await navigate({
			to: "/admin/tests/$groupId",
			params: { groupId },
		});
	};

	const handleAnswerTypeChange = (next: TestAnswerType) => {
		setAnswerType(next);
		if (next === "file_upload") {
			setGrading("manual");
		} else if (grading === "manual" && answerType === "file_upload") {
			setGrading("auto");
		}
		if (requiresOptions(next) && options.length === 0) {
			setOptions(emptyOptions());
		}
	};

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!test || isSaving) {
			return;
		}

		let correctAnswer: string | string[] | null = null;
		if (answerType === "single_choice") {
			correctAnswer = correctSingle;
		} else if (answerType === "multiple_choice") {
			correctAnswer = correctMultiple;
		} else if (answerType === "short_text" || answerType === "number") {
			correctAnswer = correctText;
		}

		const parsedPrompt = promptContentSchema.safeParse(
			toActivityContent(promptDraft),
		);
		if (!parsedPrompt.success) {
			setSaveError("Текст вопроса невалиден");
			return;
		}

		setIsSaving(true);
		setSaveError(null);
		try {
			await zero.mutate(
				mutators.updateTest({
					id: test.id,
					prompt: parsedPrompt.data,
					answerType,
					options: requiresOptions(answerType) ? options : null,
					correctAnswer: supportsCorrectAnswer(answerType)
						? correctAnswer
						: null,
					grading: answerType === "file_upload" ? "manual" : grading,
				}),
			);
			await backToGroup();
		} catch {
			setSaveError("Не удалось сохранить тест");
		} finally {
			setIsSaving(false);
		}
	};

	if (test === undefined) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка теста…</p>
			</main>
		);
	}

	if (test === null) {
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="admin-test-missing"
			>
				<EmptyState
					title="Тест не найден"
					description="Возможно, его удалили или у вас нет доступа."
					action={
						<Button asChild data-testid="test-back-to-group">
							<Link to="/admin/tests/$groupId" params={{ groupId }}>
								К группе тестов
							</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const stats = computeTestStats(test.attemptAnswers ?? [], answerType);

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-test-edit"
		>
			<PageHeader
				title="Редактор теста"
				description="Вопрос, эталон ответа и способ проверки. Эталон виден только админу."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin/tests/$groupId"
							params={{ groupId }}
							className="hover:text-foreground"
							data-testid="test-edit-group-link"
						>
							{test.group?.title ?? "Группа тестов"}
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Тест</span>
					</nav>
				}
			/>

			{stats.total > 0 ? (
				<div className="grid grid-cols-3 gap-3">
					<StatCard label="Верно" value={stats.correct} />
					<StatCard label="Неверно" value={stats.incorrect} />
					<StatCard label="На проверке" value={stats.pending} />
				</div>
			) : null}

			<form
				onSubmit={handleSave}
				className="grid gap-6"
				data-testid="test-edit-form"
			>
				<div className="grid gap-2">
					<span className="text-sm font-medium">Текст вопроса</span>
					<TheoryEditor
						key={test.id}
						content={promptDraft}
						onChange={setPromptDraft}
					/>
				</div>

				<div className="grid gap-2 sm:max-w-xs">
					<span className="text-sm font-medium">Тип ответа</span>
					<Select
						value={answerType}
						onValueChange={(value) =>
							handleAnswerTypeChange(value as TestAnswerType)
						}
					>
						<SelectTrigger className="w-full" data-testid="test-answer-type">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{TEST_ANSWER_TYPES.map((type) => (
								<SelectItem key={type} value={type}>
									{ANSWER_TYPE_LABELS[type]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{requiresOptions(answerType) ? (
					<TestOptionsEditor options={options} onChange={setOptions} />
				) : null}

				{answerType === "single_choice" ? (
					<SingleChoiceAnswer
						options={options}
						value={correctSingle}
						onChange={setCorrectSingle}
						label="Правильный вариант"
					/>
				) : null}

				{answerType === "multiple_choice" ? (
					<MultipleChoiceAnswer
						options={options}
						value={correctMultiple}
						onChange={setCorrectMultiple}
						label="Правильные варианты"
					/>
				) : null}

				{answerType === "short_text" || answerType === "number" ? (
					<ShortTextAnswer
						value={correctText}
						onChange={setCorrectText}
						label="Правильный ответ"
						placeholder={
							answerType === "number" ? "Например, 42" : "Эталонный текст"
						}
					/>
				) : null}

				{answerType === "file_upload" ? (
					<p className="text-sm text-muted-foreground">
						Файл проверяется вручную — эталонного ответа нет.
					</p>
				) : null}

				<div className="grid gap-2 sm:max-w-xs">
					<span className="text-sm font-medium">Проверка</span>
					<Select
						value={grading}
						onValueChange={(value) => setGrading(value as TestGrading)}
						disabled={answerType === "file_upload"}
					>
						<SelectTrigger className="w-full" data-testid="test-grading">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{TEST_GRADING.map((option) => (
								<SelectItem key={option} value={option}>
									{GRADING_LABELS[option]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{saveError ? (
					<p className="text-sm text-destructive">{saveError}</p>
				) : null}

				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="outline"
						data-testid="test-edit-cancel"
						onClick={() => void backToGroup()}
					>
						Отмена
					</Button>
					<Button
						type="submit"
						data-testid="test-edit-submit"
						disabled={isSaving}
					>
						{isSaving ? "Сохраняем…" : "Сохранить"}
					</Button>
				</div>
			</form>
		</main>
	);
}
