import { useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, UnlinkIcon } from "lucide-react";
import { useState } from "react";
import { AddLessonDialog } from "#/features/admin-lessons/ui/add-lesson-dialog";
import type { PublishStatus } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import {
	ConfirmActionDialog,
	EmptyState,
	EntityRow,
	PublishToggle,
	StatusBadge,
} from "@/components/lms";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TopicWithLessons = {
	id: string;
	title: string;
	position: number;
	status: string | null | undefined;
	topicLessons?: ReadonlyArray<{
		topicId: string;
		lessonId: string;
		position: number;
		lesson?: { id: string; title: string; status: string | null } | null;
	}> | null;
};

type TopicEditorProps = {
	programId: string;
	topics: ReadonlyArray<TopicWithLessons>;
};

export function TopicEditor({ programId, topics }: TopicEditorProps) {
	const zero = useZero();
	const [createOpen, setCreateOpen] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [renameId, setRenameId] = useState<string | null>(null);
	const [renameTitle, setRenameTitle] = useState("");
	const [addLessonTopicId, setAddLessonTopicId] = useState<string | null>(null);

	const sortedTopics = [...topics].sort((a, b) => a.position - b.position);
	const addLessonTopic = sortedTopics.find(
		(topic) => topic.id === addLessonTopicId,
	);
	const addLessonLinks = [...(addLessonTopic?.topicLessons ?? [])].sort(
		(a, b) => a.position - b.position,
	);

	const handleCreateTopic = async (event: React.FormEvent) => {
		event.preventDefault();
		const title = newTitle.trim();
		if (!title) {
			return;
		}
		await zero.mutate(
			mutators.createTopic({
				programId,
				title,
				position: sortedTopics.length,
			}),
		);
		setNewTitle("");
		setCreateOpen(false);
	};

	const handleRename = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!renameId || !renameTitle.trim()) {
			return;
		}
		await zero.mutate(
			mutators.updateTopic({ id: renameId, title: renameTitle.trim() }),
		);
		setRenameId(null);
		setRenameTitle("");
	};

	const handlePublishTopic = async (id: string, published: boolean) => {
		const status: PublishStatus = published ? "published" : "draft";
		await zero.mutate(mutators.publishTopic({ id, status }));
	};

	const moveTopic = async (topicId: string, direction: -1 | 1) => {
		const index = sortedTopics.findIndex((topic) => topic.id === topicId);
		const swapIndex = index + direction;
		if (index < 0 || swapIndex < 0 || swapIndex >= sortedTopics.length) {
			return;
		}
		const orderedIds = sortedTopics.map((topic) => topic.id);
		const current = orderedIds[index];
		const swap = orderedIds[swapIndex];
		if (current === undefined || swap === undefined) {
			return;
		}
		orderedIds[index] = swap;
		orderedIds[swapIndex] = current;
		await zero.mutate(mutators.reorderTopics({ programId, orderedIds }));
	};

	const handleUnlink = async (topicId: string, lessonId: string) => {
		await zero.mutate(mutators.unlinkTopicLesson({ topicId, lessonId }));
	};

	const moveLesson = async (
		topicId: string,
		lessonId: string,
		direction: -1 | 1,
	) => {
		const topic = sortedTopics.find((item) => item.id === topicId);
		const links = [...(topic?.topicLessons ?? [])].sort(
			(a, b) => a.position - b.position,
		);
		const index = links.findIndex((link) => link.lessonId === lessonId);
		const swapIndex = index + direction;
		if (index < 0 || swapIndex < 0 || swapIndex >= links.length) {
			return;
		}
		const orderedLessonIds = links.map((link) => link.lessonId);
		const current = orderedLessonIds[index];
		const swap = orderedLessonIds[swapIndex];
		if (current === undefined || swap === undefined) {
			return;
		}
		orderedLessonIds[index] = swap;
		orderedLessonIds[swapIndex] = current;
		await zero.mutate(
			mutators.reorderTopicLessons({ topicId, orderedLessonIds }),
		);
	};

	return (
		<section className="space-y-4" data-testid="topic-editor">
			<div className="flex items-center justify-between gap-3">
				<h2 className="font-heading text-lg font-medium">Темы</h2>
				<Button
					size="sm"
					data-testid="topic-create-open"
					onClick={() => setCreateOpen(true)}
				>
					<PlusIcon />
					Добавить тему
				</Button>
			</div>

			{sortedTopics.length === 0 ? (
				<EmptyState
					title="Тем пока нет"
					description="Добавьте первую тему, затем привяжите уроки из каталога."
					action={
						<Button
							data-testid="topic-create-empty"
							onClick={() => setCreateOpen(true)}
						>
							<PlusIcon />
							Добавить тему
						</Button>
					}
				/>
			) : (
				<ul className="flex flex-col gap-4">
					{sortedTopics.map((topic, topicIndex) => {
						const status = (topic.status ?? "draft") as PublishStatus;
						const links = [...(topic.topicLessons ?? [])].sort(
							(a, b) => a.position - b.position,
						);
						return (
							<li
								key={topic.id}
								className="space-y-2 rounded-xl border p-3"
								data-testid={`topic-block-${topic.id}`}
							>
								<EntityRow
									draggable
									title={topic.title}
									subtitle={`Позиция ${topic.position + 1}`}
									status={
										<StatusBadge
											status={status === "published" ? "published" : "draft"}
										/>
									}
									actions={
										<div className="flex flex-wrap items-center gap-1">
											<PublishToggle
												id={`topic-publish-${topic.id}`}
												published={status === "published"}
												onPublishedChange={(published) => {
													void handlePublishTopic(topic.id, published);
												}}
											/>
											<Button
												variant="ghost"
												size="icon-sm"
												data-testid={`topic-move-up-${topic.id}`}
												disabled={topicIndex === 0}
												onClick={() => void moveTopic(topic.id, -1)}
											>
												<ArrowUpIcon />
												<span className="sr-only">Выше</span>
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												data-testid={`topic-move-down-${topic.id}`}
												disabled={topicIndex === sortedTopics.length - 1}
												onClick={() => void moveTopic(topic.id, 1)}
											>
												<ArrowDownIcon />
												<span className="sr-only">Ниже</span>
											</Button>
											<Button
												variant="outline"
												size="sm"
												data-testid={`topic-rename-open-${topic.id}`}
												onClick={() => {
													setRenameId(topic.id);
													setRenameTitle(topic.title);
												}}
											>
												Переименовать
											</Button>
											<Button
												variant="outline"
												size="sm"
												data-testid={`topic-link-open-${topic.id}`}
												onClick={() => setAddLessonTopicId(topic.id)}
											>
												Урок
											</Button>
										</div>
									}
								/>

								{links.length === 0 ? (
									<p
										className="px-1 text-xs text-muted-foreground"
										data-testid={`topic-lessons-empty-${topic.id}`}
									>
										Уроки не привязаны.
									</p>
								) : (
									<ul className="ml-2 flex flex-col gap-1.5 border-l pl-3">
										{links.map((link, linkIndex) => (
											<li key={`${link.topicId}-${link.lessonId}`}>
												<EntityRow
													draggable
													title={link.lesson?.title ?? "Урок без названия"}
													subtitle={`Позиция ${link.position + 1}`}
													status={
														link.lesson?.status ? (
															<StatusBadge
																status={
																	link.lesson.status === "published"
																		? "published"
																		: "draft"
																}
															/>
														) : undefined
													}
													actions={
														<div className="flex items-center gap-1">
															<Button
																variant="outline"
																size="sm"
																asChild
																data-testid={`lesson-open-${link.lessonId}`}
															>
																<Link
																	to="/admin/lessons/$lessonId"
																	params={{ lessonId: link.lessonId }}
																>
																	Открыть
																</Link>
															</Button>
															<Button
																variant="ghost"
																size="icon-sm"
																data-testid={`lesson-move-up-${link.lessonId}`}
																disabled={linkIndex === 0}
																onClick={() =>
																	void moveLesson(topic.id, link.lessonId, -1)
																}
															>
																<ArrowUpIcon />
																<span className="sr-only">Выше</span>
															</Button>
															<Button
																variant="ghost"
																size="icon-sm"
																data-testid={`lesson-move-down-${link.lessonId}`}
																disabled={linkIndex === links.length - 1}
																onClick={() =>
																	void moveLesson(topic.id, link.lessonId, 1)
																}
															>
																<ArrowDownIcon />
																<span className="sr-only">Ниже</span>
															</Button>
															<ConfirmActionDialog
																title="Отвязать урок?"
																description="Урок останется в каталоге, но исчезнет из этой темы."
																confirmLabel="Отвязать"
																destructive
																onConfirm={() => {
																	void handleUnlink(topic.id, link.lessonId);
																}}
																trigger={
																	<Button
																		variant="ghost"
																		size="icon-sm"
																		data-testid={`lesson-unlink-${link.lessonId}`}
																	>
																		<UnlinkIcon />
																		<span className="sr-only">Отвязать</span>
																	</Button>
																}
															/>
														</div>
													}
												/>
											</li>
										))}
									</ul>
								)}
							</li>
						);
					})}
				</ul>
			)}

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent data-testid="topic-create-dialog">
					<form onSubmit={handleCreateTopic} className="grid gap-4">
						<DialogHeader>
							<DialogTitle>Новая тема</DialogTitle>
							<DialogDescription>
								Тема группирует уроки внутри программы.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-1.5">
							<Label htmlFor="topic-title">Название</Label>
							<Input
								id="topic-title"
								data-testid="topic-title-input"
								value={newTitle}
								onChange={(event) => setNewTitle(event.target.value)}
								placeholder="Например, Алгебра"
								required
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setCreateOpen(false)}
							>
								Отмена
							</Button>
							<Button
								type="submit"
								data-testid="topic-create-submit"
								disabled={!newTitle.trim()}
							>
								Создать
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={renameId !== null}
				onOpenChange={(open) => {
					if (!open) {
						setRenameId(null);
						setRenameTitle("");
					}
				}}
			>
				<DialogContent data-testid="topic-rename-dialog">
					<form onSubmit={handleRename} className="grid gap-4">
						<DialogHeader>
							<DialogTitle>Переименовать тему</DialogTitle>
						</DialogHeader>
						<div className="space-y-1.5">
							<Label htmlFor="topic-rename">Название</Label>
							<Input
								id="topic-rename"
								data-testid="topic-rename-input"
								value={renameTitle}
								onChange={(event) => setRenameTitle(event.target.value)}
								required
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setRenameId(null)}
							>
								Отмена
							</Button>
							<Button
								type="submit"
								data-testid="topic-rename-submit"
								disabled={!renameTitle.trim()}
							>
								Сохранить
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{addLessonTopicId ? (
				<AddLessonDialog
					open={addLessonTopicId !== null}
					onOpenChange={(open) => {
						if (!open) {
							setAddLessonTopicId(null);
						}
					}}
					programId={programId}
					topicId={addLessonTopicId}
					linkedLessonIds={addLessonLinks.map((link) => link.lessonId)}
					nextPosition={addLessonLinks.length}
				/>
			) : null}
		</section>
	);
}
