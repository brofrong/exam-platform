import { useQuery } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import {
	activityTypeLabel,
	formatLastActivity,
	type OutlineProgram,
	programProgressPercent,
	progressStatusBadge,
	topicProgressPercent,
} from "#/features/analytics/lib/progress";
import { queries } from "#/server/zero/queries";
import {
	EmptyState,
	PageHeader,
	ProgressStat,
	StatusBadge,
} from "@/components/lms";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type AnalyticsDetailPageProps = {
	userId: string;
	programId: string;
};

export function AnalyticsDetailPage({
	userId,
	programId,
}: AnalyticsDetailPageProps) {
	const [enrollments] = useQuery(queries.analyticsEnrollments());
	const [outlines] = useQuery(queries.analyticsProgramOutlines());
	const [lessonProgress] = useQuery(queries.analyticsLessonProgress());
	const [activityProgress] = useQuery(queries.analyticsActivityProgress());

	const loading =
		enrollments === undefined ||
		outlines === undefined ||
		lessonProgress === undefined ||
		activityProgress === undefined;

	const enrollment = (enrollments ?? []).find(
		(row) => row.userId === userId && row.programId === programId,
	);
	const outline = (outlines ?? []).find(
		(program) => program.id === programId,
	) as OutlineProgram | undefined;

	const lessonRows = (lessonProgress ?? []).filter(
		(row) => row.userId === userId && row.programId === programId,
	);
	const activityRows = (activityProgress ?? []).filter(
		(row) => row.userId === userId && row.programId === programId,
	);
	const lessonById = new Map(
		lessonRows.map((row) => [row.lessonId, row] as const),
	);
	const activityById = new Map(
		activityRows.map((row) => [row.activityId, row] as const),
	);

	const studentName = enrollment?.user?.name ?? "Ученик";
	const studentEmail = enrollment?.user?.email ?? "—";
	const programTitle =
		enrollment?.program?.title ?? outline?.title ?? "Программа";
	const programPercent =
		outline == null ? 0 : programProgressPercent(outline, lessonRows, userId);
	const lastActivity = formatLastActivity(activityRows, userId, programId);

	const topics = [...(outline?.topics ?? [])].sort(
		(a, b) => a.position - b.position,
	);

	return (
		<main
			className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10"
			data-testid="admin-analytics-detail"
		>
			<PageHeader
				title={studentName}
				description={`${studentEmail} · ${programTitle} · последняя активность: ${lastActivity}`}
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="analytics-detail-admin-link"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<Link
							to="/admin/analytics"
							className="hover:text-foreground"
							data-testid="analytics-detail-list-link"
						>
							Аналитика
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">{studentName}</span>
					</nav>
				}
				actions={
					<Button asChild variant="outline" data-testid="analytics-detail-back">
						<Link to="/admin/analytics">К списку</Link>
					</Button>
				}
			/>

			{loading ? (
				<p className="text-sm text-muted-foreground">Загрузка детализации…</p>
			) : enrollment == null || outline == null ? (
				<EmptyState
					title="Запись не найдена"
					description="Enrollment или программа недоступны."
					action={
						<Button asChild data-testid="analytics-detail-missing-back">
							<Link to="/admin/analytics">К аналитике</Link>
						</Button>
					}
				/>
			) : (
				<>
					<section data-testid="analytics-detail-summary">
						<ProgressStat
							label="Прогресс по программе"
							value={programPercent}
							description={
								topics.length === 0
									? "В программе пока нет тем"
									: `${topics.length} тем · ${lastActivity}`
							}
						/>
					</section>

					{topics.length === 0 ? (
						<EmptyState
							title="Тем пока нет"
							description="Добавьте темы и уроки в программу, чтобы видеть детальный прогресс."
						/>
					) : (
						<ul className="flex flex-col gap-8" data-testid="analytics-topics">
							{topics.map((topic) => {
								const topicPercent = topicProgressPercent(
									topic,
									lessonRows,
									userId,
									programId,
								);
								const links = [...(topic.topicLessons ?? [])]
									.sort((a, b) => a.position - b.position)
									.filter((link) => link.lesson != null);

								return (
									<li
										key={topic.id}
										className="space-y-4"
										data-testid={`analytics-topic-${topic.id}`}
									>
										<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
											<h2 className="font-heading text-lg font-medium">
												{topic.title}
											</h2>
											<ProgressStat
												label="Тема"
												value={topicPercent}
												className="sm:max-w-xs"
											/>
										</div>

										{links.length === 0 ? (
											<p className="text-sm text-muted-foreground">
												В теме пока нет уроков.
											</p>
										) : (
											<ul className="flex flex-col gap-6">
												{links.map((link) => {
													const lesson = link.lesson;
													if (!lesson) {
														return null;
													}
													const lessonRow = lessonById.get(lesson.id);
													const lessonStatus = progressStatusBadge(
														lessonRow?.status ?? "not_started",
													);
													const activities = [
														...(lesson.activities ?? []),
													].sort((a, b) => a.position - b.position);

													return (
														<li
															key={lesson.id}
															className="space-y-3 rounded-xl border p-4"
															data-testid={`analytics-lesson-${lesson.id}`}
														>
															<div className="flex flex-wrap items-center justify-between gap-3">
																<div className="space-y-1">
																	<h3 className="font-medium">
																		{lesson.title}
																	</h3>
																	<div className="flex flex-wrap items-center gap-2">
																		<StatusBadge
																			status={lessonStatus.status}
																			label={lessonStatus.label}
																		/>
																		<span className="text-sm text-muted-foreground">
																			{Math.round(lessonRow?.percent ?? 0)}%
																		</span>
																	</div>
																</div>
																<ProgressStat
																	label="Урок"
																	value={lessonRow?.percent ?? 0}
																	className="w-full sm:max-w-xs"
																/>
															</div>

															{activities.length === 0 ? (
																<p className="text-sm text-muted-foreground">
																	В уроке пока нет занятий.
																</p>
															) : (
																<Table
																	data-testid={`analytics-activities-${lesson.id}`}
																>
																	<TableHeader>
																		<TableRow>
																			<TableHead>Занятие</TableHead>
																			<TableHead>Тип</TableHead>
																			<TableHead>Статус</TableHead>
																		</TableRow>
																	</TableHeader>
																	<TableBody>
																		{activities.map((activity) => {
																			const activityRow = activityById.get(
																				activity.id,
																			);
																			const activityStatus =
																				progressStatusBadge(
																					activityRow?.status ?? "not_started",
																				);
																			return (
																				<TableRow
																					key={activity.id}
																					data-testid={`analytics-activity-${activity.id}`}
																				>
																					<TableCell>
																						Позиция {activity.position + 1}
																					</TableCell>
																					<TableCell>
																						{activityTypeLabel(activity.type)}
																					</TableCell>
																					<TableCell>
																						<StatusBadge
																							status={activityStatus.status}
																							label={activityStatus.label}
																						/>
																					</TableCell>
																				</TableRow>
																			);
																		})}
																	</TableBody>
																</Table>
															)}
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
				</>
			)}
		</main>
	);
}
