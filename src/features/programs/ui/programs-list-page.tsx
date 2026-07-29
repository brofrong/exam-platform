import { useQuery } from "@rocicorp/zero/react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpenIcon } from "lucide-react";
import { useState } from "react";
import { programProgressPercent } from "#/features/student-home/lib/home-stats";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader, ProgramCard } from "@/components/lms";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function progressRank(progress: number): number {
	if (progress >= 100) {
		return 2;
	}
	if (progress > 0) {
		return 0;
	}
	return 1;
}

function actionLabelFor(progress: number): string {
	if (progress >= 100) {
		return "Повторить";
	}
	if (progress > 0) {
		return "Продолжить";
	}
	return "Открыть";
}

function chipClass(active: boolean): string {
	return cn(
		"rounded-full border px-3 py-1.5 text-sm transition-colors",
		active
			? "border-primary bg-primary text-primary-foreground"
			: "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
	);
}

function ProgramsSkeleton() {
	return (
		<div
			className="grid grid-cols-1 gap-3 sm:grid-cols-2"
			data-testid="programs-skeleton"
			aria-busy="true"
		>
			<Skeleton className="h-48 rounded-xl" />
			<Skeleton className="h-48 rounded-xl" />
			<Skeleton className="h-48 rounded-xl" />
			<Skeleton className="h-48 rounded-xl" />
		</div>
	);
}

export function ProgramsListPage() {
	const navigate = useNavigate();
	const [programs] = useQuery(queries.publishedPrograms());
	const [lessonProgress] = useQuery(queries.myLessonProgress());
	const [examFilter, setExamFilter] = useState<string | null>(null);

	const programsList = programs ?? [];
	const lessonRows = lessonProgress ?? [];
	const loading = programs === undefined || lessonProgress === undefined;

	const examTypes = Array.from(
		new Set(
			programsList
				.map((program) => program.examType)
				.filter((value): value is string => Boolean(value)),
		),
	);

	const visiblePrograms = programsList
		.filter((program) => (examFilter ? program.examType === examFilter : true))
		.map((program) => ({
			program,
			progress: programProgressPercent(program, lessonRows),
		}))
		.sort((a, b) => progressRank(a.progress) - progressRank(b.progress));

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="student-programs-page"
		>
			<PageHeader
				title="Программы"
				description="Опубликованные программы, к которым у вас есть доступ."
			/>

			{loading ? (
				<ProgramsSkeleton />
			) : programsList.length === 0 ? (
				<EmptyState
					icon={<BookOpenIcon />}
					title="Пока нет программ"
					description="Активируйте приглашение, чтобы получить доступ к опубликованным программам."
				/>
			) : (
				<>
					{examTypes.length > 1 ? (
						<div className="flex flex-wrap gap-2" data-testid="program-filters">
							<button
								type="button"
								data-testid="program-filter-all"
								onClick={() => setExamFilter(null)}
								className={chipClass(examFilter === null)}
							>
								Все
							</button>
							{examTypes.map((examType) => (
								<button
									key={examType}
									type="button"
									data-testid={`program-filter-${examType}`}
									onClick={() =>
										setExamFilter(examFilter === examType ? null : examType)
									}
									className={chipClass(examFilter === examType)}
								>
									{examType}
								</button>
							))}
						</div>
					) : null}

					<ul
						className="grid grid-cols-1 gap-3 sm:grid-cols-2"
						data-testid="student-programs-list"
					>
						{visiblePrograms.map(({ program, progress }) => (
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
									actionLabel={actionLabelFor(progress)}
									onOpen={() => {
										void navigate({
											to: "/app/programs/$programId",
											params: { programId: program.id },
										});
									}}
								/>
							</li>
						))}
					</ul>
				</>
			)}
		</main>
	);
}
