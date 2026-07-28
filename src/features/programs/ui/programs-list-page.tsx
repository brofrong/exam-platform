import { useQuery } from "@rocicorp/zero/react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpenIcon } from "lucide-react";
import { programProgressPercent } from "#/features/student-home/lib/home-stats";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader, ProgramCard } from "@/components/lms";

export function ProgramsListPage() {
	const navigate = useNavigate();
	const [programs] = useQuery(queries.publishedPrograms());
	const [lessonProgress] = useQuery(queries.myLessonProgress());

	const programsList = programs ?? [];
	const lessonRows = lessonProgress ?? [];
	const loading = programs === undefined || lessonProgress === undefined;

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
				<p className="text-sm text-muted-foreground">Загрузка программ…</p>
			) : programsList.length === 0 ? (
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
		</main>
	);
}
