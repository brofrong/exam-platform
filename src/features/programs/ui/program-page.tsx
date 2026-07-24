import { useQuery } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { queries } from "#/server/zero/queries";
import {
	EmptyState,
	EntityRow,
	PageHeader,
	ProgressStat,
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
							<Link to="/app">На главную</Link>
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
							to="/app"
							className="hover:text-foreground"
							data-testid="student-program-home-link"
						>
							Кабинет
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
				<ul className="flex flex-col gap-6" data-testid="student-topics">
					{topics.map((topic) => {
						const links = [...(topic.topicLessons ?? [])]
							.sort((a, b) => a.position - b.position)
							.filter((link) => link.lesson != null);

						return (
							<li
								key={topic.id}
								className="space-y-2"
								data-testid={`student-topic-${topic.id}`}
							>
								<h2 className="font-heading text-lg font-medium">
									{topic.title}
								</h2>
								{links.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										В теме пока нет опубликованных уроков.
									</p>
								) : (
									<ul className="flex flex-col gap-2">
										{links.map((link) => {
											const lesson = link.lesson;
											if (!lesson) {
												return null;
											}
											const row = progressByLesson.get(lesson.id);
											const lessonPercent = row?.percent ?? 0;
											return (
												<li key={`${link.topicId}-${link.lessonId}`}>
													<EntityRow
														title={lesson.title}
														subtitle={`${Math.round(lessonPercent)}%`}
														actions={
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
														}
													/>
												</li>
											);
										})}
									</ul>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}
