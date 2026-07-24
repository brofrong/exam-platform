import { useQuery } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { BookOpenIcon } from "lucide-react";
import { queries } from "#/server/zero/queries";
import { EmptyState, EntityRow, PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";

type StudentHomePageProps = {
	userName: string;
};

export function StudentHomePage({ userName }: StudentHomePageProps) {
	const [programs] = useQuery(queries.publishedPrograms());

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="home-shell"
		>
			<PageHeader
				title="Кабинет"
				description={`Вы вошли как ${userName}. Выберите опубликованную программу.`}
			/>

			{programs === undefined ? (
				<p className="text-sm text-muted-foreground">Загрузка программ…</p>
			) : !programs || programs.length === 0 ? (
				<EmptyState
					icon={<BookOpenIcon />}
					title="Пока нет программ"
					description="Когда администратор опубликует программу, она появится здесь."
				/>
			) : (
				<ul className="flex flex-col gap-2" data-testid="student-programs-list">
					{programs.map((program) => (
						<li key={program.id}>
							<EntityRow
								title={program.title}
								subtitle={
									[program.examType, program.subject]
										.filter(Boolean)
										.join(" · ") || undefined
								}
								actions={
									<Button
										variant="outline"
										size="sm"
										asChild
										data-testid={`student-open-program-${program.id}`}
									>
										<Link
											to="/app/programs/$programId"
											params={{ programId: program.id }}
										>
											Открыть
										</Link>
									</Button>
								}
							/>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
