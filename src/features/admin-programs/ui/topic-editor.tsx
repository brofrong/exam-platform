import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	LinkIcon,
	PlusIcon,
	UnlinkIcon,
} from "lucide-react";
import { useState } from "react";
import type { PublishStatus } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
	const [linkTopicId, setLinkTopicId] = useState<string | null>(null);
	const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
	const [lessons] = useQuery(queries.lessons());

	const sortedTopics = [...topics].sort((a, b) => a.position - b.position);

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

	const handleLinkLesson = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!linkTopicId || !selectedLessonId) {
			return;
		}
		const topic = sortedTopics.find((item) => item.id === linkTopicId);
		const position = topic?.topicLessons?.length ?? 0;
		await zero.mutate(
			mutators.linkTopicLesson({
				topicId: linkTopicId,
				lessonId: selectedLessonId,
				position,
			}),
		);
		setLinkTopicId(null);
		setSelectedLessonId(null);
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

	const availableLessons = (lessons ?? []).filter((lesson) => {
		if (!linkTopicId) {
			return true;
		}
		const topic = sortedTopics.find((item) => item.id === linkTopicId);
		const linkedIds = new Set(
			(topic?.topicLessons ?? []).map((link) => link.lessonId),
		);
		return !linkedIds.has(lesson.id);
	});

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
												onClick={() => {
													setLinkTopicId(topic.id);
													setSelectedLessonId(null);
												}}
											>
												<LinkIcon />
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
										Уроки не привязаны.{" "}
										<Link
											to="/admin/lessons"
											className="underline underline-offset-2 hover:text-foreground"
											data-testid={`topic-lessons-catalog-link-${topic.id}`}
										>
											Открыть каталог уроков
										</Link>
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

			<Dialog
				open={linkTopicId !== null}
				onOpenChange={(open) => {
					if (!open) {
						setLinkTopicId(null);
						setSelectedLessonId(null);
					}
				}}
			>
				<DialogContent data-testid="topic-link-lesson-dialog">
					<form onSubmit={handleLinkLesson} className="grid gap-4">
						<DialogHeader>
							<DialogTitle>Привязать урок</DialogTitle>
							<DialogDescription>
								Выберите урок из каталога. Если список пуст — сначала создайте
								уроки в CMS уроков.
							</DialogDescription>
						</DialogHeader>

						{(lessons ?? []).length === 0 ? (
							<EmptyState
								title="Каталог уроков пуст"
								description="Сначала создайте уроки в каталоге, затем вернитесь сюда."
								action={
									<Button asChild data-testid="topic-link-open-lessons">
										<Link to="/admin/lessons">К каталогу уроков</Link>
									</Button>
								}
							/>
						) : availableLessons.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								Все доступные уроки уже привязаны к этой теме.
							</p>
						) : (
							<div className="space-y-1.5">
								<Label>Урок</Label>
								<Select
									value={selectedLessonId ?? undefined}
									onValueChange={(value) => setSelectedLessonId(value)}
								>
									<SelectTrigger
										className="w-full"
										data-testid="topic-link-lesson-select"
									>
										<SelectValue placeholder="Выберите урок" />
									</SelectTrigger>
									<SelectContent>
										{availableLessons.map((lesson) => (
											<SelectItem key={lesson.id} value={lesson.id}>
												{lesson.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setLinkTopicId(null)}
							>
								Отмена
							</Button>
							<Button
								type="submit"
								data-testid="topic-link-lesson-submit"
								disabled={!selectedLessonId}
							>
								Привязать
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</section>
	);
}
