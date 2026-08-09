import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SelectTestGroupDialog } from "#/features/admin-lessons/ui/select-test-group-dialog";
import {
	emptyTheoryDoc,
	normalizeTheoryDoc,
	type TheoryDoc,
	TheoryEditor,
	toActivityContent,
} from "#/features/lesson-editor";
import {
	isPracticeActivityContent,
	type PracticeActivityContent,
} from "#/server/db/activity/practice-content";
import { ACTIVITY_TYPES, type ActivityType } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** TipTap JSON document — must be JSON-serializable for the Zero mutator arg. */
const activityContentSchema = z.record(z.string(), z.json());

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
	theory: "Теория",
	practice: "Практика",
};

function asActivityType(type: string): ActivityType {
	return ACTIVITY_TYPES.includes(type as ActivityType)
		? (type as ActivityType)
		: "theory";
}

function PracticeConfigForm({
	activityId,
	lessonId,
	initial,
}: {
	activityId: string;
	lessonId: string;
	initial: PracticeActivityContent | null;
}) {
	const zero = useZero();
	const navigate = useNavigate();
	const [groups] = useQuery(queries.testGroups());
	const [pickerOpen, setPickerOpen] = useState(false);
	const [testGroupId, setTestGroupId] = useState(initial?.testGroupId ?? "");
	const [questionCount, setQuestionCount] = useState(
		String(initial?.questionCount ?? 1),
	);
	const [passPercent, setPassPercent] = useState(
		String(initial?.passPercent ?? 100),
	);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!initial) return;
		setTestGroupId(initial.testGroupId);
		setQuestionCount(String(initial.questionCount));
		setPassPercent(String(initial.passPercent));
	}, [initial]);

	const selectedGroup = useMemo(
		() => (groups ?? []).find((g) => g.id === testGroupId) ?? null,
		[groups, testGroupId],
	);
	const groupSize = selectedGroup?.tests?.length ?? 0;

	const backToLesson = async () => {
		await navigate({
			to: "/admin/lessons/$lessonId",
			params: { lessonId },
		});
	};

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		if (isSaving) return;
		const count = Number.parseInt(questionCount, 10);
		const pass = Number.parseInt(passPercent, 10);
		if (!testGroupId) {
			setError("Выберите группу тестов");
			return;
		}
		if (!Number.isFinite(count) || count < 1) {
			setError("Укажите сколько задач выдать");
			return;
		}
		if (groupSize > 0 && count > groupSize) {
			setError(`В группе только ${groupSize} тестов`);
			return;
		}
		if (!Number.isFinite(pass) || pass < 0 || pass > 100) {
			setError("Проходной балл: 0–100%");
			return;
		}
		setIsSaving(true);
		setError(null);
		try {
			await zero.mutate(
				mutators.configurePracticeActivity({
					activityId,
					testGroupId,
					questionCount: count,
					passPercent: pass,
				}),
			);
			await backToLesson();
		} catch {
			setError("Не удалось сохранить настройки практики");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<form
				onSubmit={(e) => void handleSave(e)}
				className="grid max-w-lg gap-4"
				data-testid="practice-config-form"
			>
				<div className="grid gap-2">
					<Label>Группа тестов</Label>
					<div className="flex flex-wrap items-center gap-2">
						{selectedGroup ? (
							<p className="text-sm" data-testid="practice-selected-group">
								{selectedGroup.title}
								<span className="text-muted-foreground">
									{" "}
									· {groupSize} тестов ·{" "}
									{selectedGroup.status === "published"
										? "опубликована"
										: "черновик"}
								</span>
							</p>
						) : (
							<p className="text-sm text-muted-foreground">Не выбрана</p>
						)}
						<Button
							type="button"
							variant="outline"
							size="sm"
							data-testid="practice-pick-group"
							onClick={() => setPickerOpen(true)}
						>
							{selectedGroup ? "Сменить" : "Выбрать / создать"}
						</Button>
						{testGroupId ? (
							<Button asChild type="button" variant="ghost" size="sm">
								<Link
									to="/admin/tests/$groupId"
									params={{ groupId: testGroupId }}
									data-testid="practice-edit-group"
								>
									Редактировать группу
								</Link>
							</Button>
						) : null}
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="practice-question-count">
						Сколько задач выдать ученику
					</Label>
					<Input
						id="practice-question-count"
						type="number"
						min={1}
						max={groupSize || undefined}
						value={questionCount}
						onChange={(e) => setQuestionCount(e.target.value)}
						data-testid="practice-question-count"
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="practice-pass-percent">Проходной балл, %</Label>
					<Input
						id="practice-pass-percent"
						type="number"
						min={0}
						max={100}
						value={passPercent}
						onChange={(e) => setPassPercent(e.target.value)}
						data-testid="practice-pass-percent"
					/>
					<p className="text-xs text-muted-foreground">
						Практика считается пройденной, если доля верных ответов ≥ этого
						значения. 0% — достаточно любой отправки без ошибок порога.
					</p>
				</div>

				{error ? <p className="text-sm text-destructive">{error}</p> : null}

				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => void backToLesson()}
					>
						Отмена
					</Button>
					<Button
						type="submit"
						disabled={isSaving || !testGroupId}
						data-testid="practice-config-submit"
					>
						{isSaving ? "Сохраняем…" : "Сохранить"}
					</Button>
				</div>
			</form>

			<SelectTestGroupDialog
				open={pickerOpen}
				onOpenChange={setPickerOpen}
				onSelect={setTestGroupId}
			/>
		</>
	);
}

export function ActivityEditPage({
	lessonId,
	activityId,
}: {
	lessonId: string;
	activityId: string;
}) {
	const zero = useZero();
	const navigate = useNavigate();
	const [lesson] = useQuery(queries.lessonById({ id: lessonId }));
	const [theoryDraft, setTheoryDraft] = useState<TheoryDoc>(emptyTheoryDoc);
	const [contentError, setContentError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [hydratedId, setHydratedId] = useState<string | null>(null);

	const activity =
		lesson?.activities?.find((item) => item.id === activityId) ?? null;
	const activityType = activity ? asActivityType(activity.type) : null;

	useEffect(() => {
		if (!activity || hydratedId === activity.id) {
			return;
		}
		if (asActivityType(activity.type) === "theory") {
			setTheoryDraft(normalizeTheoryDoc(activity.content));
		}
		setContentError(null);
		setIsSaving(false);
		setHydratedId(activity.id);
	}, [activity, hydratedId]);

	const practiceInitial = useMemo(() => {
		if (!activity || asActivityType(activity.type) !== "practice") {
			return null;
		}
		return isPracticeActivityContent(activity.content)
			? activity.content
			: { testGroupId: "", questionCount: 1, passPercent: 100 };
	}, [activity]);

	const backToLesson = async () => {
		await navigate({
			to: "/admin/lessons/$lessonId",
			params: { lessonId },
		});
	};

	const handleSaveTheory = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!activity || isSaving) {
			return;
		}
		const parsedContent = activityContentSchema.safeParse(
			toActivityContent(theoryDraft),
		);
		if (!parsedContent.success) {
			setContentError("Содержимое невалидно");
			return;
		}
		setIsSaving(true);
		setContentError(null);
		try {
			await zero.mutate(
				mutators.updateActivity({
					id: activity.id,
					content: parsedContent.data,
				}),
			);
			await backToLesson();
		} catch {
			setContentError("Не удалось сохранить контент");
		} finally {
			setIsSaving(false);
		}
	};

	if (lesson === undefined) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка…</p>
			</main>
		);
	}

	if (lesson === null || !activity || !activityType) {
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="admin-activity-missing"
			>
				<EmptyState
					title="Активность не найдена"
					description="Возможно, её удалили или у вас нет доступа."
					action={
						<Button asChild data-testid="activity-back-to-lesson">
							<Link to="/admin/lessons/$lessonId" params={{ lessonId }}>
								К уроку
							</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const typeLabel = ACTIVITY_TYPE_LABELS[activityType];

	return (
		<main
			className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10"
			data-testid="admin-activity-edit"
		>
			<PageHeader
				title={
					activityType === "theory" ? "Редактор теории" : "Настройки практики"
				}
				description={
					activityType === "theory"
						? "WYSIWYG TipTap. Сохраняется в содержимое активности."
						: "Привяжите группу тестов, сколько задач выдать и проходной балл."
				}
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin/lessons/$lessonId"
							params={{ lessonId }}
							className="hover:text-foreground"
							data-testid="activity-edit-lesson-link"
						>
							{lesson.title}
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">{typeLabel}</span>
					</nav>
				}
			/>

			{activityType === "theory" ? (
				<form
					onSubmit={(e) => void handleSaveTheory(e)}
					className="grid gap-4"
					data-testid="activity-content-form"
				>
					<TheoryEditor
						key={activity.id}
						content={theoryDraft}
						onChange={setTheoryDraft}
					/>
					{contentError ? (
						<p className="text-sm text-destructive">{contentError}</p>
					) : null}
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							data-testid="activity-content-cancel"
							onClick={() => void backToLesson()}
						>
							Отмена
						</Button>
						<Button
							type="submit"
							data-testid="activity-content-submit"
							disabled={isSaving}
						>
							{isSaving ? "Сохраняем…" : "Сохранить"}
						</Button>
					</div>
				</form>
			) : (
				<PracticeConfigForm
					activityId={activity.id}
					lessonId={lessonId}
					initial={practiceInitial}
				/>
			)}
		</main>
	);
}
