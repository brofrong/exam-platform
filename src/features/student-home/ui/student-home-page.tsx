import { useQuery } from "@rocicorp/zero/react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpenIcon, MessageCircleIcon } from "lucide-react";
import {
	averageEnrolledProgress,
	countCompletedLessons,
	findContinueTarget,
	formatLastActivity,
	programProgressPercent,
} from "#/features/student-home/lib/home-stats";
import { queries } from "#/server/zero/queries";
import {
	ContinueLearningCard,
	EmptyState,
	PageHeader,
	PendingReviewList,
	ProgramCard,
	StatCard,
} from "@/components/lms";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type StudentHomePageProps = {
	userName: string;
};

function formatSubmittedAt(ms: number): string {
	return new Date(ms).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function StudentHomePage({ userName }: StudentHomePageProps) {
	const navigate = useNavigate();
	const [programs] = useQuery(queries.publishedPrograms());
	const [lessonProgress] = useQuery(queries.myLessonProgress());
	const [activityProgress] = useQuery(queries.myActivityProgress());
	const [pendingSubmissions] = useQuery(queries.myPendingSubmissions());

	const programsList = programs ?? [];
	const lessonRows = lessonProgress ?? [];
	const activityRows = activityProgress ?? [];
	const pending = pendingSubmissions ?? [];

	const loading =
		programs === undefined ||
		lessonProgress === undefined ||
		activityProgress === undefined ||
		pendingSubmissions === undefined;

	const avgProgress = averageEnrolledProgress(programsList, lessonRows);
	const completedLessons = countCompletedLessons(lessonRows);
	const lastActivity = formatLastActivity(activityRows);
	const continueTarget = findContinueTarget(
		programsList,
		lessonRows,
		activityRows,
	);

	const pendingItems = pending.map((submission) => ({
		id: submission.id,
		title: submission.activity
			? submission.activity.type === "practice"
				? `Практика · позиция ${submission.activity.position + 1}`
				: `Занятие · позиция ${submission.activity.position + 1}`
			: "Работа на проверке",
		subtitle: submission.program?.title,
		submittedAt:
			submission.createdAt == null
				? undefined
				: formatSubmittedAt(submission.createdAt),
	}));

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="home-shell"
		>
			<PageHeader
				title="Кабинет"
				description={`Здравствуйте, ${userName}. Прогресс, продолжение обучения и работы на проверке.`}
			/>

			{loading ? (
				<p className="text-sm text-muted-foreground">Загрузка кабинета…</p>
			) : (
				<>
					<section
						className="grid grid-cols-1 gap-3 sm:grid-cols-3"
						data-testid="home-stats"
					>
						<StatCard
							label="Средний прогресс"
							value={`${avgProgress}%`}
							hint={
								programsList.length === 0
									? "Нет программ"
									: `по ${programsList.length} программам`
							}
						/>
						<StatCard
							label="Последняя активность"
							value={lastActivity}
							hint="по прогрессу занятий"
						/>
						<StatCard
							label="Уроков завершено"
							value={completedLessons}
							hint={
								lessonRows.length === 0
									? "пока нет данных"
									: `из ${lessonRows.length} с прогрессом`
							}
						/>
					</section>

					<section className="space-y-3" data-testid="home-continue">
						<h2 className="font-heading text-lg font-medium">Продолжить</h2>
						{continueTarget ? (
							<ContinueLearningCard
								programTitle={continueTarget.programTitle}
								lessonTitle={continueTarget.lessonTitle}
								progress={continueTarget.progress}
								onContinue={() => {
									void navigate({
										to: "/app/programs/$programId/lessons/$lessonId",
										params: {
											programId: continueTarget.programId,
											lessonId: continueTarget.lessonId,
										},
										hash: continueTarget.activityId
											? `activity-${continueTarget.activityId}`
											: undefined,
									});
								}}
							/>
						) : (
							<EmptyState
								title="Нечего продолжать"
								description="Активируйте приглашение или дождитесь публикации уроков."
							/>
						)}
					</section>

					<section className="space-y-3" data-testid="home-pending">
						<h2 className="font-heading text-lg font-medium">На проверке</h2>
						<PendingReviewList
							items={pendingItems}
							emptyTitle="Нет работ на проверке"
							emptyDescription="Отправленные ответы с ручной проверкой появятся здесь."
						/>
					</section>

					<section className="space-y-3" data-testid="home-support-preview">
						<h2 className="font-heading text-lg font-medium">Поддержка</h2>
						<Card data-testid="support-preview-card">
							<CardHeader>
								<div className="flex items-start gap-3">
									<MessageCircleIcon className="mt-0.5 size-5 text-muted-foreground" />
									<div className="space-y-1">
										<CardTitle>Чат с преподавателем</CardTitle>
										<CardDescription>
											Скоро — здесь появится переписка с преподавателем.
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardFooter>
								<Button
									asChild
									variant="outline"
									data-testid="support-preview-link"
								>
									<a href="/app/support">Открыть чат</a>
								</Button>
							</CardFooter>
						</Card>
					</section>

					<section className="space-y-3" data-testid="home-programs">
						<h2 className="font-heading text-lg font-medium">Мои программы</h2>
						{programsList.length === 0 ? (
							<EmptyState
								icon={<BookOpenIcon />}
								title="Пока нет программ"
								description="Активируйте приглашение, чтобы получить доступ к опубликованным программам."
							/>
						) : (
							<ul
								className="grid grid-cols-1 gap-3 sm:grid-cols-2"
								data-testid="student-programs-list"
							>
								{programsList.map((program) => {
									const progress = programProgressPercent(program, lessonRows);
									return (
										<li
											key={program.id}
											data-testid={`student-open-program-${program.id}`}
										>
											<ProgramCard
												className="max-w-none"
												title={program.title}
												description={program.description ?? undefined}
												examType={program.examType ?? undefined}
												subject={program.subject ?? undefined}
												progress={progress}
												onOpen={() => {
													void navigate({
														to: "/app/programs/$programId",
														params: { programId: program.id },
													});
												}}
											/>
										</li>
									);
								})}
							</ul>
						)}
					</section>
				</>
			)}
		</main>
	);
}
