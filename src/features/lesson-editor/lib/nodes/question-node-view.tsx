import type { ReactNodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
	parseGrading,
	parseOptions,
	type QuestionGrading,
} from "#/features/lesson-editor/lib/nodes/question-attrs";
import { usePracticeAnswerContext } from "#/features/lesson-editor/lib/practice-answer-context";
import { NodeDragHandle } from "#/features/lesson-editor/ui/node-drag-handle";
import {
	FileUploadAnswer,
	MultipleChoiceAnswer,
	ShortTextAnswer,
	SingleChoiceAnswer,
} from "@/components/answer-widgets";
import type { AnswerOption } from "@/components/answer-widgets/types";
import { StatusBadge } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type QuestionKind =
	| "shortText"
	| "singleChoice"
	| "multipleChoice"
	| "fileUpload";

const KIND_LABELS: Record<QuestionKind, string> = {
	shortText: "Короткий ответ",
	singleChoice: "Один вариант",
	multipleChoice: "Несколько вариантов",
	fileUpload: "Загрузка файла",
};

type QuestionNodeViewProps = ReactNodeViewProps & {
	kind: QuestionKind;
};

function updateOptionLabel(
	options: AnswerOption[],
	optionId: string,
	label: string,
): AnswerOption[] {
	return options.map((option) =>
		option.id === optionId ? { ...option, label } : option,
	);
}

function removeOption(
	options: AnswerOption[],
	optionId: string,
): AnswerOption[] {
	if (options.length <= 1) {
		return options;
	}
	return options.filter((option) => option.id !== optionId);
}

function StudentAnswerWidgets({
	kind,
	questionId,
	options,
}: {
	kind: QuestionKind;
	questionId: string;
	options: AnswerOption[];
}) {
	const answering = usePracticeAnswerContext();
	const mode = answering?.mode ?? "preview";
	const interactive = mode === "answer" || mode === "readonly";
	const disabled =
		mode !== "answer" || answering?.disabled === true || !questionId;
	const answer = answering?.answers[questionId];
	const result = answering?.results?.[questionId];

	const answerBlock = (() => {
		if (kind === "shortText") {
			const value = answer?.type === "short_text" ? answer.value : "";
			return (
				<ShortTextAnswer
					value={value}
					onChange={(next) => {
						answering?.setAnswer(questionId, {
							type: "short_text",
							value: next,
						});
					}}
					disabled={disabled}
					label="Ваш ответ"
				/>
			);
		}
		if (kind === "singleChoice") {
			const value = answer?.type === "single_choice" ? answer.optionId : null;
			return (
				<SingleChoiceAnswer
					options={options}
					value={value}
					onChange={(next) => {
						if (next) {
							answering?.setAnswer(questionId, {
								type: "single_choice",
								optionId: next,
							});
						} else {
							answering?.setAnswer(questionId, null);
						}
					}}
					disabled={disabled}
					label="Выберите один вариант"
				/>
			);
		}
		if (kind === "multipleChoice") {
			const value = answer?.type === "multiple_choice" ? answer.optionIds : [];
			return (
				<MultipleChoiceAnswer
					options={options}
					value={value}
					onChange={(next) => {
						answering?.setAnswer(questionId, {
							type: "multiple_choice",
							optionIds: next,
						});
					}}
					disabled={disabled}
					label="Выберите один или несколько вариантов"
				/>
			);
		}
		if (mode === "readonly" && answer?.type === "file_upload") {
			return (
				<p
					className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
					data-testid={`practice-answer-file-${questionId}`}
				>
					{answer.filename}
					<span className="ml-2 text-xs text-muted-foreground">
						({Math.max(1, Math.round(answer.size / 1024))} КБ)
					</span>
				</p>
			);
		}
		return (
			<FileUploadAnswer
				onChange={(files) => {
					if (files.length === 0) {
						answering?.setAnswer(questionId, null);
					}
				}}
				onUpload={
					answering?.uploadFile
						? async (file, ctx) => {
								const uploadedFile = await answering.uploadFile?.(file, ctx);
								if (uploadedFile) {
									answering.setAnswer(questionId, {
										type: "file_upload",
										storageKey: uploadedFile.storageKey,
										filename: uploadedFile.filename,
										mime: uploadedFile.mime,
										size: uploadedFile.size,
									});
								}
								return uploadedFile;
							}
						: undefined
				}
				disabled={disabled}
				label="Файл ответа"
				multiple={false}
			/>
		);
	})();

	return (
		<div className="rounded-lg border border-dashed border-border bg-background p-3">
			<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
				<p className="text-xs text-muted-foreground">
					{interactive
						? mode === "readonly"
							? "Ваш ответ"
							: "Ответ"
						: "Превью ответа ученика"}
				</p>
				{result && result !== "pending" ? (
					<StatusBadge
						status={result}
						data-testid={`practice-answer-result-${questionId}`}
					/>
				) : result === "pending" ? (
					<StatusBadge
						status="pending"
						data-testid={`practice-answer-result-${questionId}`}
					/>
				) : null}
			</div>
			{answerBlock}
		</div>
	);
}

export function QuestionNodeView({
	kind,
	node,
	updateAttributes,
	editor,
	selected,
}: QuestionNodeViewProps) {
	const editable = editor.isEditable;
	const prompt = String(node.attrs.prompt ?? "");
	const grading = parseGrading(
		node.attrs.grading,
		kind === "fileUpload" ? "manual" : "auto",
	);
	const options = parseOptions(node.attrs.options);
	const correctAnswer = node.attrs.correctAnswer;
	const questionId = String(node.attrs.questionId ?? "");

	const setGrading = (next: QuestionGrading) => {
		updateAttributes({ grading: next });
	};

	return (
		<NodeViewWrapper
			as="div"
			className={cn(
				"my-3 rounded-xl border border-border bg-muted/20 p-3",
				selected && "ring-2 ring-ring/40",
			)}
			data-testid={`practice-question-${kind}`}
			data-question-id={questionId || undefined}
			data-grading={grading}
		>
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<div className="flex min-w-0 items-center gap-2">
					{editable ? (
						<NodeDragHandle
							label={`Переместить вопрос: ${KIND_LABELS[kind]}`}
							data-testid={`practice-question-drag-handle-${kind}`}
						/>
					) : null}
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						{KIND_LABELS[kind]}
					</p>
				</div>
				{editable && kind !== "fileUpload" ? (
					<div className="flex items-center gap-2">
						<Label
							htmlFor={`grading-${questionId}`}
							className="text-xs text-muted-foreground"
						>
							Проверка
						</Label>
						<Select
							value={grading}
							onValueChange={(value) => {
								if (value === "auto" || value === "manual") {
									setGrading(value);
								}
							}}
						>
							<SelectTrigger
								id={`grading-${questionId}`}
								size="sm"
								className="w-[9.5rem]"
								data-testid={`practice-question-grading-${kind}`}
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="auto">Авто</SelectItem>
								<SelectItem value="manual">Вручную</SelectItem>
							</SelectContent>
						</Select>
					</div>
				) : (
					<span
						className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
						data-testid={`practice-question-grading-badge-${kind}`}
					>
						{grading === "auto" ? "Авто" : "Вручную"}
					</span>
				)}
			</div>

			{editable ? (
				<div className="mb-3 space-y-1.5">
					<Label htmlFor={`prompt-${questionId}`}>Вопрос</Label>
					<Textarea
						id={`prompt-${questionId}`}
						value={prompt}
						rows={2}
						data-testid={`practice-question-prompt-${kind}`}
						onChange={(event) =>
							updateAttributes({ prompt: event.target.value })
						}
					/>
				</div>
			) : (
				<p
					className="mb-3 text-sm font-medium text-foreground"
					data-testid={`practice-question-prompt-text-${kind}`}
				>
					{prompt}
				</p>
			)}

			{(kind === "singleChoice" || kind === "multipleChoice") && editable ? (
				<div
					className="mb-3 space-y-2"
					data-testid={`practice-question-options-${kind}`}
				>
					<Label>Варианты ответа</Label>
					<ul className="flex flex-col gap-2">
						{options.map((option, index) => (
							<li key={option.id} className="flex items-center gap-2">
								<Input
									value={option.label}
									aria-label={`Вариант ${index + 1}`}
									data-testid={`practice-question-option-${kind}-${option.id}`}
									onChange={(event) =>
										updateAttributes({
											options: updateOptionLabel(
												options,
												option.id,
												event.target.value,
											),
										})
									}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									disabled={options.length <= 1}
									aria-label="Удалить вариант"
									data-testid={`practice-question-option-remove-${kind}-${option.id}`}
									onClick={() => {
										const nextOptions = removeOption(options, option.id);
										const patch: Record<string, unknown> = {
											options: nextOptions,
										};
										if (kind === "singleChoice") {
											const current =
												typeof correctAnswer === "string"
													? correctAnswer
													: null;
											if (current === option.id) {
												patch.correctAnswer = nextOptions[0]?.id ?? null;
											}
										} else if (Array.isArray(correctAnswer)) {
											patch.correctAnswer = correctAnswer.filter(
												(id) => id !== option.id,
											);
										}
										updateAttributes(patch);
									}}
								>
									<Trash2Icon />
								</Button>
							</li>
						))}
					</ul>
					<Button
						type="button"
						variant="outline"
						size="sm"
						data-testid={`practice-question-option-add-${kind}`}
						onClick={() =>
							updateAttributes({
								options: [
									...options,
									{
										id: crypto.randomUUID(),
										label: `Вариант ${options.length + 1}`,
									},
								],
							})
						}
					>
						<PlusIcon />
						Добавить вариант
					</Button>
				</div>
			) : null}

			{editable && kind === "shortText" ? (
				<div className="mb-3 space-y-1.5">
					<Label htmlFor={`correct-${questionId}`}>Правильный ответ</Label>
					<Input
						id={`correct-${questionId}`}
						value={typeof correctAnswer === "string" ? correctAnswer : ""}
						placeholder="Эталон для автопроверки"
						data-testid="practice-question-correct-shortText"
						onChange={(event) =>
							updateAttributes({ correctAnswer: event.target.value })
						}
					/>
				</div>
			) : null}

			{editable && kind === "singleChoice" ? (
				<div className="mb-3 space-y-1.5">
					<Label htmlFor={`correct-${questionId}`}>Правильный вариант</Label>
					<Select
						value={
							typeof correctAnswer === "string" ? correctAnswer : undefined
						}
						onValueChange={(value) => {
							if (value) {
								updateAttributes({ correctAnswer: value });
							}
						}}
					>
						<SelectTrigger
							id={`correct-${questionId}`}
							data-testid="practice-question-correct-singleChoice"
						>
							<SelectValue placeholder="Выберите вариант" />
						</SelectTrigger>
						<SelectContent>
							{options.map((option) => (
								<SelectItem key={option.id} value={option.id}>
									{option.label || option.id}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			) : null}

			{editable && kind === "multipleChoice" ? (
				<div className="mb-3 space-y-2">
					<Label>Правильные варианты</Label>
					<ul
						className="flex flex-col gap-2"
						data-testid="practice-question-correct-multipleChoice"
					>
						{options.map((option) => {
							const selectedIds = Array.isArray(correctAnswer)
								? correctAnswer
								: [];
							const checked = selectedIds.includes(option.id);
							const optionInputId = `correct-${questionId}-${option.id}`;
							return (
								<li key={option.id} className="flex items-center gap-2">
									<Checkbox
										id={optionInputId}
										checked={checked}
										data-testid={`practice-question-correct-multipleChoice-${option.id}`}
										onCheckedChange={(next) => {
											const isChecked = next === true;
											const updated = isChecked
												? [...selectedIds, option.id]
												: selectedIds.filter((id) => id !== option.id);
											updateAttributes({ correctAnswer: updated });
										}}
									/>
									<Label htmlFor={optionInputId} className="font-normal">
										{option.label || option.id}
									</Label>
								</li>
							);
						})}
					</ul>
				</div>
			) : null}

			{editable ? (
				<div className="rounded-lg border border-dashed border-border bg-background p-3">
					<p className="mb-2 text-xs text-muted-foreground">
						Превью ответа ученика
					</p>
					{kind === "shortText" ? (
						<ShortTextAnswer
							value=""
							onChange={() => undefined}
							disabled
							label="Ваш ответ"
						/>
					) : null}
					{kind === "singleChoice" ? (
						<SingleChoiceAnswer
							options={options}
							value={null}
							onChange={() => undefined}
							disabled
							label="Выберите один вариант"
						/>
					) : null}
					{kind === "multipleChoice" ? (
						<MultipleChoiceAnswer
							options={options}
							value={[]}
							onChange={() => undefined}
							disabled
							label="Выберите один или несколько вариантов"
						/>
					) : null}
					{kind === "fileUpload" ? (
						<FileUploadAnswer
							onChange={() => undefined}
							disabled
							label="Файл ответа"
							multiple={false}
						/>
					) : null}
				</div>
			) : (
				<StudentAnswerWidgets
					kind={kind}
					questionId={questionId}
					options={options}
				/>
			)}
		</NodeViewWrapper>
	);
}
