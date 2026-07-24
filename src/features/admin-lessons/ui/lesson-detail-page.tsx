import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { ActivityEditor } from "#/features/admin-lessons/ui/activity-editor";
import {
	LessonFormDialog,
	type LessonFormValues,
} from "#/features/admin-lessons/ui/lesson-form-dialog";
import type { PublishStatus } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import {
	EmptyState,
	PageHeader,
	PublishToggle,
	StatusBadge,
} from "@/components/lms";
import { Button } from "@/components/ui/button";

type LessonDetailPageProps = {
	lessonId: string;
};

export function LessonDetailPage({ lessonId }: LessonDetailPageProps) {
	const zero = useZero();
	const [lesson] = useQuery(queries.lessonById({ id: lessonId }));
	const [editOpen, setEditOpen] = useState(false);

	if (lesson === undefined) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка урока…</p>
			</main>
		);
	}

	if (lesson === null) {
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="admin-lesson-missing"
			>
				<EmptyState
					title="Урок не найден"
					description="Возможно, его удалили или у вас нет доступа."
					action={
						<Button asChild data-testid="lesson-back-to-list">
							<Link to="/admin/lessons">К списку уроков</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const status = (lesson.status ?? "draft") as PublishStatus;

	const handlePublish = async (published: boolean) => {
		const next: PublishStatus = published ? "published" : "draft";
		await zero.mutate(mutators.publishLesson({ id: lesson.id, status: next }));
	};

	const handleUpdate = async (values: LessonFormValues) => {
		await zero.mutate(
			mutators.updateLesson({
				id: lesson.id,
				title: values.title,
			}),
		);
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-lesson-detail"
		>
			<PageHeader
				title={lesson.title}
				description="Редактирование урока и порядка activities."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="lesson-detail-admin-link"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<Link
							to="/admin/lessons"
							className="hover:text-foreground"
							data-testid="lesson-detail-list-link"
						>
							Уроки
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">{lesson.title}</span>
					</nav>
				}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<StatusBadge
							status={status === "published" ? "published" : "draft"}
						/>
						<PublishToggle
							id={`lesson-detail-publish-${lesson.id}`}
							published={status === "published"}
							onPublishedChange={(published) => {
								void handlePublish(published);
							}}
						/>
						<Button
							variant="outline"
							data-testid="lesson-edit-open"
							onClick={() => setEditOpen(true)}
						>
							<PencilIcon />
							Редактировать
						</Button>
					</div>
				}
			/>

			<ActivityEditor
				lessonId={lesson.id}
				activities={lesson.activities ?? []}
			/>

			<LessonFormDialog
				key={lesson.id}
				open={editOpen}
				onOpenChange={setEditOpen}
				mode="edit"
				initial={{ title: lesson.title }}
				onSubmit={handleUpdate}
			/>
		</main>
	);
}
