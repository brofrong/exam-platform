import { useQuery } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { PracticeActivity } from "#/features/lesson-player/ui/practice-activity";
import { TheoryActivityView } from "#/features/lesson-player/ui/theory-activity-view";
import {
	formatLockHint,
	resolveLessonAccess,
} from "#/features/program-locks/lib/resolve-access";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";

type LessonPlayerPageProps = {
	programId: string;
	lessonId: string;
};

export function LessonPlayerPage({
	programId,
	lessonId,
}: LessonPlayerPageProps) {
	const [program] = useQuery(queries.publishedProgramById({ id: programId }));
	const [lesson] = useQuery(queries.publishedLessonById({ id: lessonId }));
	const [lessonProgress] = useQuery(queries.myLessonProgress());

	if (
		program === undefined ||
		lesson === undefined ||
		lessonProgress === undefined
	) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка урока…</p>
			</main>
		);
	}

	if (program === null || lesson === null) {
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="lesson-player-missing"
			>
				<EmptyState
					title="Урок недоступен"
					description="Урок не опубликован или у вас пока нет доступа."
					action={
						<Button asChild data-testid="lesson-player-back-home">
							<Link to="/app">На главную</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const lessonProgressById: Record<string, number> = {};
	for (const row of lessonProgress ?? []) {
		if (row.programId === programId) {
			lessonProgressById[row.lessonId] = row.percent;
		}
	}
	const access = resolveLessonAccess({
		program,
		lessonId,
		lessonProgressById,
	});

	if (!access.unlocked) {
		const hint = formatLockHint({
			threshold: access.threshold,
			topicBlockers: access.topicBlockers,
			lessonBlockers: access.lessonBlockers,
		});
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="lesson-locked"
			>
				<EmptyState
					title="Занятие закрыто"
					description={hint}
					action={
						<Button asChild data-testid="lesson-locked-back">
							<Link to="/app/programs/$programId" params={{ programId }}>
								К программе
							</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const activities = [...(lesson.activities ?? [])].sort(
		(a, b) => a.position - b.position,
	);

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="lesson-player"
		>
			<PageHeader
				title={lesson.title}
				description={program.title}
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/app"
							className="hover:text-foreground"
							data-testid="lesson-player-home-link"
						>
							Кабинет
						</Link>
						<span className="mx-1.5">/</span>
						<Link
							to="/app/programs/$programId"
							params={{ programId }}
							className="hover:text-foreground"
							data-testid="lesson-player-program-link"
						>
							{program.title}
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">{lesson.title}</span>
					</nav>
				}
			/>

			{activities.length === 0 ? (
				<EmptyState
					title="В уроке пока нет материалов"
					description="Администратор ещё не добавил теорию или практику."
				/>
			) : (
				<ol className="flex flex-col gap-8" data-testid="lesson-activities">
					{activities.map((activity, index) => (
						<li key={activity.id} className="space-y-3">
							<div className="flex items-baseline justify-between gap-3">
								<h2 className="font-heading text-lg font-medium">
									{activity.type === "theory" ? "Теория" : "Практика"}
								</h2>
								<span className="text-xs text-muted-foreground">
									{index + 1} / {activities.length}
								</span>
							</div>
							{activity.type === "theory" ? (
								<TheoryActivityView
									programId={programId}
									activityId={activity.id}
									content={activity.content}
								/>
							) : (
								<PracticeActivity
									programId={programId}
									activityId={activity.id}
									content={activity.content}
								/>
							)}
						</li>
					))}
				</ol>
			)}
		</main>
	);
}
