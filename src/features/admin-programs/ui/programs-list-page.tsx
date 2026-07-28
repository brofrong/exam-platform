import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import {
	ProgramFormDialog,
	type ProgramFormValues,
} from "#/features/admin-programs/ui/program-form-dialog";
import type { PublishStatus } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import {
	EmptyState,
	EntityRow,
	PageHeader,
	PublishToggle,
	StatusBadge,
} from "@/components/lms";
import { Button } from "@/components/ui/button";

export function ProgramsListPage() {
	const zero = useZero();
	const navigate = useNavigate();
	const [programs] = useQuery(queries.programs());
	const [createOpen, setCreateOpen] = useState(false);

	const handleCreate = async (values: ProgramFormValues) => {
		const id = crypto.randomUUID();
		await zero.mutate(
			mutators.createProgram({
				id,
				title: values.title,
				description: values.description || null,
				examType: values.examType,
				subject: values.subject,
			}),
		);
		await navigate({
			to: "/admin/programs/$programId",
			params: { programId: id },
		});
	};

	const handlePublish = async (id: string, published: boolean) => {
		const status: PublishStatus = published ? "published" : "draft";
		await zero.mutate(mutators.publishProgram({ id, status }));
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-programs-list"
		>
			<PageHeader
				title="Программы"
				description="Создавайте программы, темы и привязку уроков."
				breadcrumbs={
					<nav className="text-sm">
						<span className="text-foreground">Программы</span>
					</nav>
				}
				actions={
					<Button
						data-testid="program-create-open"
						onClick={() => setCreateOpen(true)}
					>
						<PlusIcon />
						Новая программа
					</Button>
				}
			/>

			{!programs || programs.length === 0 ? (
				<EmptyState
					icon={<BookOpenIcon />}
					title="Пока нет программ"
					description="Создайте первую программу — темы и уроки можно добавить на следующем шаге."
					action={
						<Button
							data-testid="program-create-empty"
							onClick={() => setCreateOpen(true)}
						>
							<PlusIcon />
							Создать программу
						</Button>
					}
				/>
			) : (
				<ul className="flex flex-col gap-2" data-testid="programs-list">
					{programs.map((program) => {
						const status = (program.status ?? "draft") as PublishStatus;
						return (
							<li key={program.id}>
								<EntityRow
									title={program.title}
									subtitle={[program.examType, program.subject]
										.filter(Boolean)
										.join(" · ")}
									status={
										<StatusBadge
											status={status === "published" ? "published" : "draft"}
										/>
									}
									actions={
										<div className="flex items-center gap-2">
											<PublishToggle
												id={`program-publish-${program.id}`}
												published={status === "published"}
												onPublishedChange={(published) => {
													void handlePublish(program.id, published);
												}}
											/>
											<Button
												variant="outline"
												size="sm"
												asChild
												data-testid={`program-open-${program.id}`}
											>
												<Link
													to="/admin/programs/$programId"
													params={{ programId: program.id }}
												>
													Открыть
												</Link>
											</Button>
										</div>
									}
								/>
							</li>
						);
					})}
				</ul>
			)}

			<ProgramFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				mode="create"
				onSubmit={handleCreate}
			/>
		</main>
	);
}
