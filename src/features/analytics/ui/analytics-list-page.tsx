import { useQuery } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChartColumnIcon } from "lucide-react";
import {
	formatLastActivity,
	type OutlineProgram,
	programProgressPercent,
} from "#/features/analytics/lib/progress";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader, ProgressStat } from "@/components/lms";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function AnalyticsListPage() {
	const navigate = useNavigate();
	const [enrollments] = useQuery(queries.analyticsEnrollments());
	const [outlines] = useQuery(queries.analyticsProgramOutlines());
	const [lessonProgress] = useQuery(queries.analyticsLessonProgress());
	const [activityProgress] = useQuery(queries.analyticsActivityProgress());

	const loading =
		enrollments === undefined ||
		outlines === undefined ||
		lessonProgress === undefined ||
		activityProgress === undefined;

	const outlineById = new Map(
		(outlines ?? []).map((program) => [program.id, program] as const),
	);

	const rows = (enrollments ?? []).map((enrollment) => {
		const outline = outlineById.get(enrollment.programId) as
			| OutlineProgram
			| undefined;
		const percent =
			outline == null
				? 0
				: programProgressPercent(
						outline,
						lessonProgress ?? [],
						enrollment.userId,
					);
		return {
			key: enrollment.id,
			userId: enrollment.userId,
			programId: enrollment.programId,
			studentName: enrollment.user?.name ?? "Ученик",
			studentEmail: enrollment.user?.email ?? "—",
			programTitle: enrollment.program?.title ?? "Программа",
			percent,
			lastActivity: formatLastActivity(
				activityProgress ?? [],
				enrollment.userId,
				enrollment.programId,
			),
		};
	});

	return (
		<main
			className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10"
			data-testid="admin-analytics-list"
		>
			<PageHeader
				title="Аналитика"
				description="Прогресс учеников по программам — откройте строку для детализации."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="analytics-admin-link"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Аналитика</span>
					</nav>
				}
				actions={
					<Button asChild variant="outline" data-testid="analytics-back-admin">
						<Link to="/admin">Назад</Link>
					</Button>
				}
			/>

			{loading ? (
				<p className="text-sm text-muted-foreground">Загрузка аналитики…</p>
			) : rows.length === 0 ? (
				<EmptyState
					icon={<ChartColumnIcon />}
					title="Пока нет записей"
					description="Когда ученики запишутся на программы, прогресс появится здесь."
				/>
			) : (
				<Table data-testid="analytics-enrollments-table">
					<TableHeader>
						<TableRow>
							<TableHead>Ученик</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Программа</TableHead>
							<TableHead className="min-w-40">Прогресс</TableHead>
							<TableHead>Последняя активность</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row) => (
							<TableRow
								key={row.key}
								className="cursor-pointer"
								data-testid={`analytics-row-${row.userId}-${row.programId}`}
								onClick={() => {
									void navigate({
										to: "/admin/analytics/$userId/$programId",
										params: {
											userId: row.userId,
											programId: row.programId,
										},
									});
								}}
							>
								<TableCell className="font-medium">{row.studentName}</TableCell>
								<TableCell className="text-muted-foreground">
									{row.studentEmail}
								</TableCell>
								<TableCell>{row.programTitle}</TableCell>
								<TableCell>
									<ProgressStat
										label="Уроки"
										value={row.percent}
										className="min-w-36"
									/>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{row.lastActivity}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</main>
	);
}
