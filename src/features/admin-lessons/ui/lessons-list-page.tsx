import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { NotebookPenIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import {
	LessonFormDialog,
	type LessonFormValues,
} from "#/features/admin-lessons/ui/lesson-form-dialog";
import type { PublishStatus } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import {
	EmptyState,
	EntityRow,
	PageHeader,
	PublishToggle,
	StatusBadge,
} from "@/components/lms";
import { Button } from "@/components/ui/button";

export function LessonsListPage() {
	const zero = useZero();
	const navigate = useNavigate();
	const [lessons] = useQuery(queries.lessons());
	const [createOpen, setCreateOpen] = useState(false);

	const handleCreate = async (values: LessonFormValues) => {
		const id = crypto.randomUUID();
		await zero.mutate(
			mutators.createLesson({
				id,
				title: values.title,
			}),
		);
		await navigate({
			to: "/admin/lessons/$lessonId",
			params: { lessonId: id },
		});
	};

	const handlePublish = async (id: string, published: boolean) => {
		const status: PublishStatus = published ? "published" : "draft";
		await zero.mutate(mutators.publishLesson({ id, status }));
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-lessons-list"
		>
			<PageHeader
				title="Уроки"
				description="Каталог уроков и activities (теория / практика)."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="admin-lessons-back"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Уроки</span>
					</nav>
				}
				actions={
					<Button
						data-testid="lesson-create-open"
						onClick={() => setCreateOpen(true)}
					>
						<PlusIcon />
						Новый урок
					</Button>
				}
			/>

			{!lessons || lessons.length === 0 ? (
				<EmptyState
					icon={<NotebookPenIcon />}
					title="Пока нет уроков"
					description="Создайте урок, добавьте activities, затем привяжите его к темам в программах."
					action={
						<Button
							data-testid="lesson-create-empty"
							onClick={() => setCreateOpen(true)}
						>
							<PlusIcon />
							Создать урок
						</Button>
					}
				/>
			) : (
				<ul className="flex flex-col gap-2" data-testid="lessons-list">
					{lessons.map((lesson) => {
						const status = (lesson.status ?? "draft") as PublishStatus;
						return (
							<li key={lesson.id}>
								<EntityRow
									title={lesson.title}
									status={
										<StatusBadge
											status={status === "published" ? "published" : "draft"}
										/>
									}
									actions={
										<div className="flex items-center gap-2">
											<PublishToggle
												id={`lesson-publish-${lesson.id}`}
												published={status === "published"}
												onPublishedChange={(published) => {
													void handlePublish(lesson.id, published);
												}}
											/>
											<Button
												variant="outline"
												size="sm"
												asChild
												data-testid={`lesson-open-${lesson.id}`}
											>
												<Link
													to="/admin/lessons/$lessonId"
													params={{ lessonId: lesson.id }}
												>
													Открыть
												</Link>
											</Button>
										</div>
									}
								/>
							</li>
						);
					})}
				</ul>
			)}

			<LessonFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				mode="create"
				onSubmit={handleCreate}
			/>
		</main>
	);
}
