import { useQuery, useZero } from "@rocicorp/zero/react";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AddLessonDialog } from "#/features/admin-lessons/ui/add-lesson-dialog";
import { LessonDetailPage } from "#/features/admin-lessons/ui/lesson-detail-page";
import { ProgramDetailPage } from "#/features/admin-programs/ui/program-detail-page";
import {
	ProgramFormDialog,
	type ProgramFormValues,
} from "#/features/admin-programs/ui/program-form-dialog";
import { ProgramsListPage } from "#/features/admin-programs/ui/programs-list-page";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const MD_UP_QUERY = "(min-width: 768px)";

function subscribeMdUp(onStoreChange: () => void) {
	const media = window.matchMedia(MD_UP_QUERY);
	media.addEventListener("change", onStoreChange);
	return () => media.removeEventListener("change", onStoreChange);
}

function getMdUpSnapshot() {
	return window.matchMedia(MD_UP_QUERY).matches;
}

/** Desktop-first on SSR so e2e / hydration match CI Desktop Chrome. */
function getMdUpServerSnapshot() {
	return true;
}

function useIsMdUp() {
	return useSyncExternalStore(
		subscribeMdUp,
		getMdUpSnapshot,
		getMdUpServerSnapshot,
	);
}

import { File, Folder, Tree } from "@/components/ui/file-tree";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export type ProgramsSearch = {
	topic?: string;
	lesson?: string;
};

function nodeProgram(id: string) {
	return `program:${id}`;
}
function nodeTopic(id: string) {
	return `topic:${id}`;
}
function nodeLesson(topicId: string, lessonId: string) {
	return `lesson:${topicId}:${lessonId}`;
}

function parseTreeId(id: string): {
	kind: "program" | "topic" | "lesson";
	programId?: string;
	topicId?: string;
	lessonId?: string;
} | null {
	if (id.startsWith("program:")) {
		return { kind: "program", programId: id.slice("program:".length) };
	}
	if (id.startsWith("topic:")) {
		return { kind: "topic", topicId: id.slice("topic:".length) };
	}
	if (id.startsWith("lesson:")) {
		const rest = id.slice("lesson:".length);
		const [topicId, lessonId] = rest.split(":");
		if (!topicId || !lessonId) {
			return null;
		}
		return { kind: "lesson", topicId, lessonId };
	}
	return null;
}

export function ProgramsWorkspacePage({
	programId,
	search,
}: {
	programId?: string;
	search: ProgramsSearch;
}) {
	// Mount only one layout — CSS-hidden duplicates still match Playwright testids.
	const isDesktop = useIsMdUp();

	if (isDesktop) {
		return (
			<div data-testid="programs-workspace-desktop">
				<ProgramsDesktopWorkspace programId={programId} search={search} />
			</div>
		);
	}

	return (
		<div data-testid="programs-workspace-mobile">
			{programId ? (
				<ProgramDetailPage programId={programId} />
			) : (
				<ProgramsListPage />
			)}
		</div>
	);
}

function ProgramsDesktopWorkspace({
	programId,
	search,
}: {
	programId?: string;
	search: ProgramsSearch;
}) {
	const zero = useZero();
	const navigate = useNavigate();
	const [outline] = useQuery(queries.programsOutline());
	const [createOpen, setCreateOpen] = useState(false);
	const [topicCreateForProgram, setTopicCreateForProgram] = useState<
		string | null
	>(null);
	const [newTopicTitle, setNewTopicTitle] = useState("");
	const [addLessonTopic, setAddLessonTopic] = useState<{
		programId: string;
		topicId: string;
		linkedLessonIds: string[];
		nextPosition: number;
	} | null>(null);

	const programs = outline ?? [];

	const selectedId = useMemo(() => {
		if (search.lesson && search.topic) {
			return nodeLesson(search.topic, search.lesson);
		}
		if (search.topic) {
			return nodeTopic(search.topic);
		}
		if (programId) {
			return nodeProgram(programId);
		}
		return undefined;
	}, [programId, search.lesson, search.topic]);

	const defaultExpanded = useMemo(() => {
		const ids: string[] = [];
		if (programId) {
			ids.push(nodeProgram(programId));
		}
		if (search.topic) {
			ids.push(nodeTopic(search.topic));
		}
		return ids;
	}, [programId, search.topic]);

	const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpanded);

	const selectedProgram = useMemo(() => {
		if (!programId) {
			return null;
		}
		return programs.find((p) => p.id === programId) ?? null;
	}, [programId, programs]);

	const selectedTopic = useMemo(() => {
		if (!search.topic || !selectedProgram) {
			return null;
		}
		return (
			(selectedProgram.topics ?? []).find((t) => t.id === search.topic) ?? null
		);
	}, [search.topic, selectedProgram]);

	const navigateSelection = async (treeId: string) => {
		const parsed = parseTreeId(treeId);
		if (!parsed) {
			return;
		}
		if (parsed.kind === "program" && parsed.programId) {
			await navigate({
				to: "/admin/programs/$programId",
				params: { programId: parsed.programId },
				search: {},
			});
			return;
		}
		if (parsed.kind === "topic" && parsed.topicId) {
			const program = programs.find((p) =>
				(p.topics ?? []).some((t) => t.id === parsed.topicId),
			);
			if (!program) {
				return;
			}
			await navigate({
				to: "/admin/programs/$programId",
				params: { programId: program.id },
				search: { topic: parsed.topicId },
			});
			return;
		}
		if (parsed.kind === "lesson" && parsed.topicId && parsed.lessonId) {
			const program = programs.find((p) =>
				(p.topics ?? []).some((t) => t.id === parsed.topicId),
			);
			if (!program) {
				return;
			}
			await navigate({
				to: "/admin/programs/$programId",
				params: { programId: program.id },
				search: { topic: parsed.topicId, lesson: parsed.lessonId },
			});
		}
	};

	const handleCreateProgram = async (values: ProgramFormValues) => {
		const id = crypto.randomUUID();
		await zero.mutate(
			mutators.createProgram({
				id,
				title: values.title,
				description: values.description || null,
				examType: values.examType,
				subject: values.subject,
			}),
		);
		await navigate({
			to: "/admin/programs/$programId",
			params: { programId: id },
			search: {},
		});
	};

	const handleCreateTopic = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!topicCreateForProgram || !newTopicTitle.trim()) {
			return;
		}
		const program = programs.find((p) => p.id === topicCreateForProgram);
		const position = program?.topics?.length ?? 0;
		await zero.mutate(
			mutators.createTopic({
				programId: topicCreateForProgram,
				title: newTopicTitle.trim(),
				position,
			}),
		);
		setNewTopicTitle("");
		setTopicCreateForProgram(null);
	};

	return (
		<div
			className="flex h-[calc(100svh)] min-h-0 w-full"
			data-testid="admin-programs-workspace"
		>
			<aside className="flex w-72 shrink-0 flex-col border-r border-border bg-muted/20">
				<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
					<h1 className="text-sm font-semibold">Программы</h1>
					<Button
						size="sm"
						data-testid="program-create-open"
						onClick={() => setCreateOpen(true)}
					>
						<PlusIcon />
						Новая
					</Button>
				</div>
				<ScrollArea className="flex-1 p-2">
					{programs.length === 0 ? (
						<p className="px-2 py-4 text-xs text-muted-foreground">
							Пока нет программ
						</p>
					) : (
						<Tree
							selectedId={selectedId}
							onSelect={(id) => void navigateSelection(id)}
							expandedIds={expandedIds}
							onExpandedChange={setExpandedIds}
						>
							{programs.map((program) => (
								<Folder
									key={program.id}
									value={nodeProgram(program.id)}
									element={program.title}
								>
									{(program.topics ?? []).map((topic) => (
										<Folder
											key={topic.id}
											value={nodeTopic(topic.id)}
											element={topic.title}
										>
											{(topic.topicLessons ?? []).map((link) => (
												<File
													key={`${link.topicId}-${link.lessonId}`}
													value={nodeLesson(link.topicId, link.lessonId)}
												>
													{link.lesson?.title ?? "Урок"}
												</File>
											))}
										</Folder>
									))}
								</Folder>
							))}
						</Tree>
					)}
				</ScrollArea>
			</aside>

			<section className="min-w-0 flex-1 overflow-y-auto p-6">
				{!programId ? (
					<EmptyState
						title="Выберите программу"
						description="Откройте программу в дереве слева или создайте новую."
						action={
							<Button
								data-testid="program-create-empty"
								onClick={() => setCreateOpen(true)}
							>
								<PlusIcon />
								Создать программу
							</Button>
						}
					/>
				) : search.lesson ? (
					<LessonDetailPage lessonId={search.lesson} embedded />
				) : search.topic && selectedTopic ? (
					<div
						className="mx-auto flex max-w-3xl flex-col gap-6"
						data-testid="topic-pane"
					>
						<PageHeader
							title={selectedTopic.title}
							description="Тема программы"
							actions={
								<div className="flex flex-wrap items-center gap-2">
									<StatusBadge
										status={
											(selectedTopic.status ?? "draft") === "published"
												? "published"
												: "draft"
										}
									/>
									<PublishToggle
										id={`topic-publish-${selectedTopic.id}`}
										published={
											(selectedTopic.status ?? "draft") === "published"
										}
										onPublishedChange={(published) => {
											const status: PublishStatus = published
												? "published"
												: "draft";
											void zero.mutate(
												mutators.publishTopic({
													id: selectedTopic.id,
													status,
												}),
											);
										}}
									/>
									<Button
										data-testid={`topic-link-open-${selectedTopic.id}`}
										onClick={() =>
											setAddLessonTopic({
												programId: programId,
												topicId: selectedTopic.id,
												linkedLessonIds: (selectedTopic.topicLessons ?? []).map(
													(l) => l.lessonId,
												),
												nextPosition: selectedTopic.topicLessons?.length ?? 0,
											})
										}
									>
										<PlusIcon />
										Урок
									</Button>
								</div>
							}
						/>
						<ul className="flex flex-col gap-2">
							{(selectedTopic.topicLessons ?? []).map((link) => (
								<li key={link.lessonId}>
									<Button
										variant="outline"
										className="h-auto w-full justify-start px-3 py-2"
										onClick={() =>
											void navigate({
												to: "/admin/programs/$programId",
												params: { programId },
												search: {
													topic: selectedTopic.id,
													lesson: link.lessonId,
												},
											})
										}
									>
										{link.lesson?.title ?? "Урок"}
									</Button>
								</li>
							))}
						</ul>
					</div>
				) : selectedProgram ? (
					<div
						className="mx-auto flex max-w-3xl flex-col gap-6"
						data-testid="admin-program-detail"
					>
						<PageHeader
							title={selectedProgram.title}
							description={
								selectedProgram.description?.trim()
									? selectedProgram.description
									: `${selectedProgram.examType} · ${selectedProgram.subject}`
							}
							actions={
								<div className="flex flex-wrap items-center gap-2">
									<StatusBadge
										status={
											(selectedProgram.status ?? "draft") === "published"
												? "published"
												: "draft"
										}
									/>
									<PublishToggle
										id={`program-detail-publish-${selectedProgram.id}`}
										published={
											(selectedProgram.status ?? "draft") === "published"
										}
										onPublishedChange={(published) => {
											const status: PublishStatus = published
												? "published"
												: "draft";
											void zero.mutate(
												mutators.publishProgram({
													id: selectedProgram.id,
													status,
												}),
											);
										}}
									/>
									<PublishToggle
										id={`program-detail-public-${selectedProgram.id}`}
										published={selectedProgram.public ?? false}
										publishedLabel="Публичная"
										draftLabel="По приглашению"
										onPublishedChange={(isPublic) => {
											void zero.mutate(
												mutators.updateProgram({
													id: selectedProgram.id,
													public: isPublic,
												}),
											);
										}}
									/>
									<Button
										data-testid="topic-create-open"
										onClick={() => setTopicCreateForProgram(selectedProgram.id)}
									>
										<PlusIcon />
										Тема
									</Button>
								</div>
							}
						/>
						<ul className="flex flex-col gap-2">
							{(selectedProgram.topics ?? []).map((topic) => (
								<li key={topic.id}>
									<Button
										variant="outline"
										className="h-auto w-full justify-start px-3 py-2"
										onClick={() =>
											void navigate({
												to: "/admin/programs/$programId",
												params: { programId: selectedProgram.id },
												search: { topic: topic.id },
											})
										}
									>
										{topic.title}
									</Button>
								</li>
							))}
						</ul>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">Загрузка…</p>
				)}
			</section>

			<ProgramFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				mode="create"
				onSubmit={handleCreateProgram}
			/>

			<Dialog
				open={topicCreateForProgram !== null}
				onOpenChange={(open) => {
					if (!open) {
						setTopicCreateForProgram(null);
						setNewTopicTitle("");
					}
				}}
			>
				<DialogContent data-testid="topic-create-dialog">
					<form onSubmit={handleCreateTopic} className="grid gap-4">
						<DialogHeader>
							<DialogTitle>Новая тема</DialogTitle>
							<DialogDescription>
								Тема группирует уроки внутри программы.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-1.5">
							<Label htmlFor="workspace-topic-title">Название</Label>
							<Input
								id="workspace-topic-title"
								data-testid="topic-title-input"
								value={newTopicTitle}
								onChange={(event) => setNewTopicTitle(event.target.value)}
								required
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setTopicCreateForProgram(null)}
							>
								Отмена
							</Button>
							<Button
								type="submit"
								data-testid="topic-create-submit"
								disabled={!newTopicTitle.trim()}
							>
								Создать
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{addLessonTopic ? (
				<AddLessonDialog
					open
					onOpenChange={(open) => {
						if (!open) {
							setAddLessonTopic(null);
						}
					}}
					programId={addLessonTopic.programId}
					topicId={addLessonTopic.topicId}
					linkedLessonIds={addLessonTopic.linkedLessonIds}
					nextPosition={addLessonTopic.nextPosition}
				/>
			) : null}
		</div>
	);
}
