import { useQuery } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { LockIcon } from "lucide-react";
import {
	formatLockHint,
	resolveLessonAccess,
	resolveTopicAccess,
} from "#/features/program-locks/lib/resolve-access";
import { queries } from "#/server/zero/queries";
import {
	EmptyState,
	EntityRow,
	PageHeader,
	ProgressStat,
	TopicTimeline,
} from "@/components/lms";
import { Button } from "@/components/ui/button";

type ProgramPageProps = {
	programId: string;
};

export function ProgramPage({ programId }: ProgramPageProps) {
	const [program] = useQuery(queries.publishedProgramById({ id: programId }));
	const [lessonProgress] = useQuery(queries.myLessonProgress());

	if (program === undefined || lessonProgress === undefined) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка программы…</p>
			</main>
		);
	}

	if (program === null) {
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="student-program-missing"
			>
				<EmptyState
					title="Программа недоступна"
					description="Программа не опубликована или у вас пока нет доступа."
					action={
						<Button asChild data-testid="student-program-back-home">
							<Link to="/app/programs">К программам</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const topics = [...(program.topics ?? [])].sort(
		(a, b) => a.position - b.position,
	);
	const lessons = topics.flatMap((topic) =>
		[...(topic.topicLessons ?? [])]
			.sort((a, b) => a.position - b.position)
			.map((link) => link.lesson)
			.filter((lesson): lesson is NonNullable<typeof lesson> => lesson != null),
	);
	const progressRows = (lessonProgress ?? []).filter(
		(row) => row.programId === programId,
	);
	const progressByLesson = new Map(
		progressRows.map((row) => [row.lessonId, row] as const),
	);
	const lessonProgressById: Record<string, number> = {};
	for (const row of progressRows) {
		lessonProgressById[row.lessonId] = row.percent;
	}
	const completedCount = progressRows.filter(
		(row) => row.status === "completed",
	).length;
	const programPercent =
		lessons.length === 0
			? 0
			: Math.round(
					lessons.reduce(
						(acc, lesson) =>
							acc + (progressByLesson.get(lesson.id)?.percent ?? 0),
						0,
					) / lessons.length,
				);

	const timelineItems = topics.map((topic) => {
		const links = [...(topic.topicLessons ?? [])]
			.sort((a, b) => a.position - b.position)
			.filter((link) => link.lesson != null);
		const topicLessons = links
			.map((link) => link.lesson)
			.filter((lesson): lesson is NonNullable<typeof lesson> => lesson != null);
		const completedInTopic = topicLessons.filter(
			(lesson) => progressByLesson.get(lesson.id)?.status === "completed",
		).length;
		const percent =
			topicLessons.length === 0
				? 0
				: Math.round((completedInTopic / topicLessons.length) * 100);
		const topicAccess = resolveTopicAccess({
			program,
			topicId: topic.id,
			lessonProgressById,
		});

		return {
			id: topic.id,
			title: topic.title,
			percent,
			children:
				links.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						В теме пока нет опубликованных уроков.
					</p>
				) : (
					<ul className="flex flex-col gap-2">
						{!topicAccess.unlocked ? (
							<li
								className="flex items-center gap-2 text-sm text-muted-foreground"
								data-testid={`student-locked-topic-${topic.id}`}
							>
								<LockIcon className="size-3.5 shrink-0" />
								{formatLockHint({
									threshold: topicAccess.threshold,
									topicBlockers: topicAccess.blockers,
									lessonBlockers: [],
								})}
							</li>
						) : null}
						{links.map((link) => {
							const lesson = link.lesson;
							if (!lesson) {
								return null;
							}
							const row = progressByLesson.get(lesson.id);
							const lessonPercent = row?.percent ?? 0;
							const access = resolveLessonAccess({
								program,
								lessonId: lesson.id,
								lessonProgressById,
							});
							const hint = formatLockHint({
								threshold: access.threshold,
								topicBlockers: access.topicBlockers,
								lessonBlockers: access.lessonBlockers,
							});
							return (
								<li key={`${link.topicId}-${link.lessonId}`}>
									<EntityRow
										title={lesson.title}
										subtitle={
											access.unlocked ? `${Math.round(lessonPercent)}%` : hint
										}
										actions={
											access.unlocked ? (
												<Button
													variant="outline"
													size="sm"
													asChild
													data-testid={`student-open-lesson-${lesson.id}`}
												>
													<Link
														to="/app/programs/$programId/lessons/$lessonId"
														params={{
															programId,
															lessonId: lesson.id,
														}}
													>
														Открыть
													</Link>
												</Button>
											) : (
												<Button
													variant="outline"
													size="sm"
													disabled
													title={hint}
													data-testid={`student-locked-lesson-${lesson.id}`}
												>
													<LockIcon />
													Закрыто
												</Button>
											)
										}
									/>
								</li>
							);
						})}
					</ul>
				),
		};
	});

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="student-program-outline"
		>
			<PageHeader
				title={program.title}
				description={
					program.description ??
					[program.examType, program.subject].filter(Boolean).join(" · ")
				}
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/app/programs"
							className="hover:text-foreground"
							data-testid="student-program-home-link"
						>
							Программы
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">{program.title}</span>
					</nav>
				}
			/>

			<section data-testid="student-program-progress">
				<ProgressStat
					label="Прогресс по программе"
					value={programPercent}
					description={
						lessons.length === 0
							? "Уроков пока нет"
							: progressRows.length === 0
								? `0 из ${lessons.length} уроков (прогресс появится после прохождения)`
								: `${completedCount} из ${lessons.length} уроков завершено`
					}
				/>
			</section>

			{topics.length === 0 ? (
				<EmptyState
					title="Тем пока нет"
					description="Опубликованные темы появятся здесь."
				/>
			) : (
				<section data-testid="student-topics">
					<TopicTimeline items={timelineItems} />
				</section>
			)}
		</main>
	);
}
