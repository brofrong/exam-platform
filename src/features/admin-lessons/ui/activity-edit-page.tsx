import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
	emptyPracticeDoc,
	emptyTheoryDoc,
	normalizePracticeDoc,
	normalizeTheoryDoc,
	type PracticeDoc,
	PracticeEditor,
	type TheoryDoc,
	TheoryEditor,
	toActivityContent,
	toPracticeActivityContent,
} from "#/features/lesson-editor";
import { ACTIVITY_TYPES, type ActivityType } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
	theory: "Теория",
	practice: "Практика",
};

const activityContentSchema = z.record(z.string(), z.json());
type ActivityContent = z.infer<typeof activityContentSchema>;

function asActivityType(type: string): ActivityType {
	return ACTIVITY_TYPES.includes(type as ActivityType)
		? (type as ActivityType)
		: "theory";
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
	const [practiceDraft, setPracticeDraft] =
		useState<PracticeDoc>(emptyPracticeDoc);
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
		} else {
			setPracticeDraft(normalizePracticeDoc(activity.content));
		}
		setContentError(null);
		setIsSaving(false);
		setHydratedId(activity.id);
	}, [activity, hydratedId]);

	const backToLesson = async () => {
		await navigate({
			to: "/admin/lessons/$lessonId",
			params: { lessonId },
		});
	};

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!activity || !activityType || isSaving) {
			return;
		}

		const payload =
			activityType === "theory"
				? toActivityContent(theoryDraft)
				: toPracticeActivityContent(practiceDraft);
		const parsed = activityContentSchema.safeParse(payload);
		if (!parsed.success) {
			setContentError("Контент редактора невалиден");
			return;
		}
		const content: ActivityContent = parsed.data;

		setIsSaving(true);
		setContentError(null);
		try {
			await zero.mutate(
				mutators.updateActivity({
					id: activity.id,
					content,
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
					activityType === "theory" ? "Редактор теории" : "Редактор практики"
				}
				description={
					activityType === "theory"
						? "WYSIWYG TipTap. Сохраняется в содержимое активности."
						: "TipTap с вопросами (короткий ответ, выбор, файл). Эталоны ответов видны только админу."
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

			<form
				onSubmit={handleSave}
				className="grid gap-4"
				data-testid="activity-content-form"
			>
				{activityType === "theory" ? (
					<TheoryEditor
						key={activity.id}
						content={theoryDraft}
						onChange={setTheoryDraft}
					/>
				) : (
					<PracticeEditor
						key={activity.id}
						content={practiceDraft}
						onChange={setPracticeDraft}
					/>
				)}
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
		</main>
	);
}
