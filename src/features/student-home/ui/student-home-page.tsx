import { useQuery } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	BookOpenIcon,
	CheckCircle2Icon,
	ClockIcon,
	MessageCircleIcon,
	TrendingUpIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import {
	averageEnrolledProgress,
	countCompletedLessons,
	findContinueTarget,
	formatLastActivity,
	greetingForHour,
} from "#/features/student-home/lib/home-stats";
import { queries } from "#/server/zero/queries";
import { can, type Role } from "#/shared/authz";
import {
	ContinueLearningCard,
	EmptyState,
	PageHeader,
	PendingReviewList,
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
import { Skeleton } from "@/components/ui/skeleton";

type StudentHomePageProps = {
	userId: string;
	userName: string;
	role: Role;
};

function enterStyle(index: number): CSSProperties {
	return { "--enter-index": index } as CSSProperties;
}

function formatSubmittedAt(ms: number): string {
	return new Date(ms).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function previewBody(body: string, max = 120): string {
	const trimmed = body.trim();
	if (trimmed.length <= max) {
		return trimmed;
	}
	return `${trimmed.slice(0, max - 1)}…`;
}

function HomeSkeleton() {
	return (
		<div
			className="flex flex-col gap-8"
			data-testid="home-skeleton"
			aria-busy="true"
		>
			<section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<Skeleton className="h-[7.5rem] rounded-xl" />
				<Skeleton className="h-[7.5rem] rounded-xl" />
				<Skeleton className="h-[7.5rem] rounded-xl" />
			</section>
			<section className="space-y-3">
				<Skeleton className="h-6 w-28" />
				<Skeleton className="h-44 max-w-2xl rounded-xl" />
			</section>
			<div className="grid gap-8 lg:grid-cols-2">
				<section className="space-y-3">
					<Skeleton className="h-6 w-28" />
					<Skeleton className="h-36 rounded-xl" />
				</section>
				<section className="space-y-3">
					<Skeleton className="h-6 w-28" />
					<Skeleton className="h-36 rounded-xl" />
				</section>
			</div>
		</div>
	);
}

function SupportPreviewCard({ userId }: { userId: string }) {
	const [thread] = useQuery(queries.mySupportThread());
	const messages = thread?.messages ?? [];
	const last = messages.length > 0 ? messages[messages.length - 1] : undefined;
	const hasNewReply = last != null && last.authorId !== userId;

	const description = last
		? previewBody(last.body)
		: "Напишите преподавателю — ответ появится в чате.";

	return (
		<Card data-testid="support-preview-card">
			<CardHeader>
				<div className="flex items-start gap-3">
					<MessageCircleIcon className="mt-0.5 size-5 text-muted-foreground" />
					<div className="space-y-1">
						<CardTitle className="flex flex-wrap items-center gap-2">
							Чат с преподавателем
							{hasNewReply ? (
								<span
									className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
									data-testid="support-preview-new"
								>
									<span className="size-1.5 rounded-full bg-primary" />
									Новый ответ
								</span>
							) : null}
						</CardTitle>
						<CardDescription data-testid="support-preview-last">
							{description}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardFooter>
				<Button asChild variant="outline" data-testid="support-preview-link">
					<Link to="/app/support">Открыть чат</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

export function StudentHomePage({
	userId,
	userName,
	role,
}: StudentHomePageProps) {
	const navigate = useNavigate();
	const showAdminPrograms = can(role, "program:write");
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

	const handlePendingReviewClick = (id: string) => {
		const submission = pending.find((row) => row.id === id);
		const lessonId = submission?.activity?.lessonId;
		if (!submission || !lessonId) {
			return;
		}
		void navigate({
			to: "/app/programs/$programId/lessons/$lessonId",
			params: { programId: submission.programId, lessonId },
			hash: `activity-${submission.activityId}`,
		});
	};

	const greeting = greetingForHour(new Date().getHours());

	return (
		<main
			className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10"
			data-testid="home-shell"
		>
			<PageHeader
				title={`${greeting}, ${userName}`}
				description="Прогресс, продолжение обучения и работы на проверке."
				actions={
					<div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-2">
						{showAdminPrograms ? (
							<Button
								asChild
								variant="default"
								data-testid="profile-open-admin-programs"
							>
								<Link to="/admin/programs">Создание программ</Link>
							</Button>
						) : null}
						<Button
							asChild
							variant="outline"
							data-testid="profile-open-settings"
						>
							<Link to="/app/settings">Настройки</Link>
						</Button>
					</div>
				}
			/>

			<section
				className="flex flex-col gap-2 md:hidden"
				data-testid="student-mobile-account"
			>
				{showAdminPrograms ? (
					<Button
						asChild
						className="w-full"
						data-testid="mobile-open-admin-programs"
					>
						<Link to="/admin/programs">Создание программ</Link>
					</Button>
				) : null}
				<Button
					asChild
					variant="outline"
					className="w-full"
					data-testid="mobile-open-settings"
				>
					<Link to="/app/settings">Настройки</Link>
				</Button>
			</section>

			{loading ? (
				<HomeSkeleton />
			) : (
				<>
					<section
						className="app-enter grid grid-cols-1 gap-3 sm:grid-cols-3"
						style={enterStyle(0)}
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
							icon={<TrendingUpIcon />}
							progress={avgProgress}
						/>
						<StatCard
							label="Последняя активность"
							value={lastActivity}
							hint="по прогрессу занятий"
							icon={<ClockIcon />}
						/>
						<StatCard
							label="Уроков завершено"
							value={completedLessons}
							hint={
								lessonRows.length === 0
									? "пока нет данных"
									: `из ${lessonRows.length} с прогрессом`
							}
							icon={<CheckCircle2Icon />}
						/>
					</section>

					<section
						className="app-enter space-y-3"
						style={enterStyle(1)}
						data-testid="home-continue"
					>
						<h2 className="font-heading text-lg font-medium">Продолжить</h2>
						{continueTarget ? (
							<ContinueLearningCard
								className="max-w-2xl"
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
								icon={<BookOpenIcon />}
								title="Нечего продолжать"
								description="Активируйте приглашение или дождитесь публикации уроков."
								action={
									<Button
										asChild
										variant="outline"
										data-testid="home-goto-programs"
									>
										<Link to="/app/programs">Перейти к программам</Link>
									</Button>
								}
							/>
						)}
					</section>

					<div className="grid gap-8 lg:grid-cols-2">
						<section
							className="app-enter space-y-3"
							style={enterStyle(2)}
							data-testid="home-pending"
						>
							<h2 className="font-heading text-lg font-medium">На проверке</h2>
							<PendingReviewList
								items={pendingItems}
								emptyTitle="Нет работ на проверке"
								emptyDescription="Отправленные ответы с ручной проверкой появятся здесь."
								onItemClick={handlePendingReviewClick}
							/>
						</section>

						<section
							className="app-enter space-y-3"
							style={enterStyle(3)}
							data-testid="home-support-preview"
						>
							<h2 className="font-heading text-lg font-medium">Поддержка</h2>
							<SupportPreviewCard userId={userId} />
						</section>
					</div>
				</>
			)}
		</main>
	);
}
