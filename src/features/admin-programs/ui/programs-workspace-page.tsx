import { useQuery, useZero } from "@rocicorp/zero/react";
import {
	Outlet,
	useNavigate,
	useParams,
	useSearch,
} from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { ActivityEditPage } from "#/features/admin-lessons/ui/activity-edit-page";
import { AddLessonDialog } from "#/features/admin-lessons/ui/add-lesson-dialog";
import { LessonDetailPage } from "#/features/admin-lessons/ui/lesson-detail-page";
import { ProgramDetailPage } from "#/features/admin-programs/ui/program-detail-page";
import {
	ProgramFormDialog,
	type ProgramFormValues,
} from "#/features/admin-programs/ui/program-form-dialog";
import { ProgramsListPage } from "#/features/admin-programs/ui/programs-list-page";
import { ProgramLockSettings } from "#/features/program-locks";
import {
	ACTIVITY_TYPES,
	type ActivityType,
	type PublishStatus,
} from "#/server/zero/constants";
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
import { File, Folder, Tree } from "@/components/ui/file-tree";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const MD_UP_QUERY = "(min-width: 768px)";

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
	theory: "Теория",
	practice: "Практика",
};

function asActivityType(type: string): ActivityType {
	return ACTIVITY_TYPES.includes(type as ActivityType)
		? (type as ActivityType)
		: "theory";
}

function activityTreeLabel(
	activities: ReadonlyArray<{ id: string; type: string }>,
	activityId: string,
): string {
	const activity = activities.find((item) => item.id === activityId);
	if (!activity) {
		return "Активность";
	}
	const type = asActivityType(activity.type);
	const base = ACTIVITY_TYPE_LABELS[type];
	const sameType = activities.filter(
		(item) => asActivityType(item.type) === type,
	);
	if (sameType.length <= 1) {
		return base;
	}
	const index = sameType.findIndex((item) => item.id === activityId) + 1;
	return `${base} · ${index}`;
}

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

export type ProgramsSearch = {
	topic?: string;
	lesson?: string;
	activity?: string;
};

type ProgramsShellContextValue = {
	onRequestCreateProgram: () => void;
	onRequestCreateTopic: (programId: string) => void;
};

const ProgramsShellContext = createContext<ProgramsShellContextValue | null>(
	null,
);

function useProgramsShell() {
	const ctx = useContext(ProgramsShellContext);
	if (!ctx) {
		throw new Error(
			"useProgramsShell must be used within ProgramsDesktopShell",
		);
	}
	return ctx;
}

function nodeProgram(id: string) {
	return `program:${id}`;
}
function nodeTopic(id: string) {
	return `topic:${id}`;
}
function nodeLesson(topicId: string, lessonId: string) {
	return `lesson:${topicId}:${lessonId}`;
}
function nodeActivity(topicId: string, lessonId: string, activityId: string) {
	return `activity:${topicId}:${lessonId}:${activityId}`;
}

function parseTreeId(id: string): {
	kind: "program" | "topic" | "lesson" | "activity";
	programId?: string;
	topicId?: string;
	lessonId?: string;
	activityId?: string;
} | null {
	if (id.startsWith("program:")) {
		return { kind: "program", programId: id.slice("program:".length) };
	}
	if (id.startsWith("topic:")) {
		return { kind: "topic", topicId: id.slice("topic:".length) };
	}
	if (id.startsWith("activity:")) {
		const rest = id.slice("activity:".length);
		const [topicId, lessonId, activityId] = rest.split(":");
		if (!topicId || !lessonId || !activityId) {
			return null;
		}
		return { kind: "activity", topicId, lessonId, activityId };
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

/** Stable shell: filetree lives here so route changes only swap the Outlet. */
export function ProgramsWorkspaceLayout() {
	const isDesktop = useIsMdUp();

	if (!isDesktop) {
		return (
			<div data-testid="programs-workspace-mobile">
				<Outlet />
			</div>
		);
	}

	return (
		<div data-testid="programs-workspace-desktop">
			<ProgramsDesktopShell />
		</div>
	);
}

function ProgramsDesktopShell() {
	const zero = useZero();
	const navigate = useNavigate();
	const [outline, outlineDetails] = useQuery(queries.programsOutline(), {
		ttl: "5m",
	});
	const [createOpen, setCreateOpen] = useState(false);
	const [topicCreateForProgram, setTopicCreateForProgram] = useState<
		string | null
	>(null);
	const [newTopicTitle, setNewTopicTitle] = useState("");

	const cachedOutlineRef = useRef(outline);
	if (outline.length > 0 || outlineDetails.type === "complete") {
		cachedOutlineRef.current = outline;
	}
	const programs =
		outline.length > 0 || outlineDetails.type === "complete"
			? outline
			: (cachedOutlineRef.current ?? outline);

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

	const shellContext = useMemo(
		() => ({
			onRequestCreateProgram: () => setCreateOpen(true),
			onRequestCreateTopic: (id: string) => setTopicCreateForProgram(id),
		}),
		[],
	);

	return (
		<ProgramsShellContext.Provider value={shellContext}>
			<div
				className="flex h-[calc(100svh)] min-h-0 w-full"
				data-testid="admin-programs-workspace"
			>
				<ProgramsFileTreeAside
					programs={programs}
					showEmpty={
						outlineDetails.type === "complete" && programs.length === 0
					}
				/>

				<section className="min-w-0 flex-1 overflow-y-auto p-6">
					<Outlet />
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
			</div>
		</ProgramsShellContext.Provider>
	);
}

function ProgramsFileTreeAside({
	programs,
	showEmpty,
}: {
	showEmpty: boolean;
	programs: ReadonlyArray<{
		id: string;
		title: string;
		topics?: ReadonlyArray<{
			id: string;
			title: string;
			topicLessons?: ReadonlyArray<{
				topicId: string;
				lessonId: string;
				lesson?: {
					title?: string | null;
					activities?: ReadonlyArray<{ id: string; type: string }> | null;
				} | null;
			}>;
		}>;
	}>;
}) {
	const navigate = useNavigate();
	const search = useSearch({ from: "/admin/programs" });
	const params = useParams({ strict: false });
	const programId =
		typeof params.programId === "string" ? params.programId : undefined;

	const selectedId = useMemo(() => {
		if (search.activity && search.lesson && search.topic) {
			return nodeActivity(search.topic, search.lesson, search.activity);
		}
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
	}, [programId, search.activity, search.lesson, search.topic]);

	const requiredExpanded = useMemo(() => {
		const ids: string[] = [];
		if (programId) {
			ids.push(nodeProgram(programId));
		}
		if (search.topic) {
			ids.push(nodeTopic(search.topic));
		}
		if (search.topic && search.lesson) {
			ids.push(nodeLesson(search.topic, search.lesson));
		}
		return ids;
	}, [programId, search.lesson, search.topic]);

	const [expandedIds, setExpandedIds] = useState<string[]>(requiredExpanded);

	useEffect(() => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			let changed = false;
			for (const id of requiredExpanded) {
				if (!next.has(id)) {
					next.add(id);
					changed = true;
				}
			}
			return changed ? [...next] : prev;
		});
	}, [requiredExpanded]);

	const navigateSelection = useCallback(
		async (treeId: string) => {
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
				return;
			}
			if (
				parsed.kind === "activity" &&
				parsed.topicId &&
				parsed.lessonId &&
				parsed.activityId
			) {
				const program = programs.find((p) =>
					(p.topics ?? []).some((t) => t.id === parsed.topicId),
				);
				if (!program) {
					return;
				}
				await navigate({
					to: "/admin/programs/$programId",
					params: { programId: program.id },
					search: {
						topic: parsed.topicId,
						lesson: parsed.lessonId,
						activity: parsed.activityId,
					},
				});
			}
		},
		[navigate, programs],
	);

	const { onRequestCreateProgram } = useProgramsShell();

	return (
		<aside className="flex w-72 shrink-0 flex-col border-r border-border bg-muted/20">
			<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
				<h1 className="text-sm font-semibold">Программы</h1>
				<Button
					size="sm"
					data-testid="program-create-open"
					onClick={onRequestCreateProgram}
				>
					<PlusIcon />
					Новая
				</Button>
			</div>
			<ScrollArea className="flex-1 p-2">
				{showEmpty ? (
					<p className="px-2 py-4 text-xs text-muted-foreground">
						Пока нет программ
					</p>
				) : programs.length === 0 ? null : (
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
										{(topic.topicLessons ?? []).map((link) => {
											const activities = link.lesson?.activities ?? [];
											return (
												<Folder
													key={`${link.topicId}-${link.lessonId}`}
													value={nodeLesson(link.topicId, link.lessonId)}
													element={link.lesson?.title ?? "Урок"}
												>
													{activities.map((activity) => (
														<File
															key={activity.id}
															value={nodeActivity(
																link.topicId,
																link.lessonId,
																activity.id,
															)}
														>
															{activityTreeLabel(activities, activity.id)}
														</File>
													))}
												</Folder>
											);
										})}
									</Folder>
								))}
							</Folder>
						))}
					</Tree>
				)}
			</ScrollArea>
		</aside>
	);
}

/** Index route (no program selected) — desktop empty state or mobile list. */
export function ProgramsWorkspaceIndexPane() {
	const isDesktop = useIsMdUp();

	if (!isDesktop) {
		return <ProgramsListPage />;
	}

	return <ProgramsEmptyPane />;
}

function ProgramsEmptyPane() {
	const { onRequestCreateProgram } = useProgramsShell();

	return (
		<EmptyState
			title="Выберите программу"
			description="Откройте программу в дереве слева или создайте новую."
			action={
				<Button
					data-testid="program-create-empty"
					onClick={onRequestCreateProgram}
				>
					<PlusIcon />
					Создать программу
				</Button>
			}
		/>
	);
}

/** `$programId` route content — desktop detail panes or mobile program page. */
export function ProgramsWorkspaceProgramPane({
	programId,
}: {
	programId: string;
}) {
	const isDesktop = useIsMdUp();

	if (!isDesktop) {
		return <ProgramDetailPage programId={programId} />;
	}

	return <ProgramsDesktopProgramPane programId={programId} />;
}

function ProgramsDesktopProgramPane({ programId }: { programId: string }) {
	const zero = useZero();
	const navigate = useNavigate();
	const search = useSearch({ from: "/admin/programs" });
	const { onRequestCreateTopic } = useProgramsShell();
	const [outline] = useQuery(queries.programsOutline());
	const [addLessonTopic, setAddLessonTopic] = useState<{
		programId: string;
		topicId: string;
		linkedLessonIds: string[];
		nextPosition: number;
	} | null>(null);

	const programs = outline ?? [];
	const selectedProgram = useMemo(
		() => programs.find((p) => p.id === programId) ?? null,
		[programId, programs],
	);
	const selectedTopic = useMemo(() => {
		if (!search.topic || !selectedProgram) {
			return null;
		}
		return (
			(selectedProgram.topics ?? []).find((t) => t.id === search.topic) ?? null
		);
	}, [search.topic, selectedProgram]);

	if (search.activity && search.lesson && search.topic) {
		return (
			<ActivityEditPage
				lessonId={search.lesson}
				activityId={search.activity}
				embedded
				onBack={() =>
					navigate({
						to: "/admin/programs/$programId",
						params: { programId },
						search: {
							topic: search.topic,
							lesson: search.lesson,
						},
					})
				}
			/>
		);
	}

	if (search.lesson) {
		return <LessonDetailPage lessonId={search.lesson} embedded />;
	}

	if (search.topic && selectedTopic) {
		return (
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
								published={(selectedTopic.status ?? "draft") === "published"}
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

	if (selectedProgram) {
		return (
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
								published={(selectedProgram.status ?? "draft") === "published"}
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
								onClick={() => onRequestCreateTopic(selectedProgram.id)}
							>
								<PlusIcon />
								Тема
							</Button>
						</div>
					}
				/>
				<ProgramLockSettings program={selectedProgram} />
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
		);
	}

	return <p className="text-sm text-muted-foreground">Загрузка…</p>;
}
