import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import {
	ProgramFormDialog,
	type ProgramFormValues,
} from "#/features/admin-programs/ui/program-form-dialog";
import { TopicEditor } from "#/features/admin-programs/ui/topic-editor";
import type { PublishStatus } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import {
	EmptyState,
	PageHeader,
	PublishToggle,
	StatusBadge,
} from "@/components/lms";
import { Button } from "@/components/ui/button";

type ProgramDetailPageProps = {
	programId: string;
};

export function ProgramDetailPage({ programId }: ProgramDetailPageProps) {
	const zero = useZero();
	const [program] = useQuery(queries.programById({ id: programId }));
	const [editOpen, setEditOpen] = useState(false);

	if (program === undefined) {
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
				data-testid="admin-program-missing"
			>
				<EmptyState
					title="Программа не найдена"
					description="Возможно, её удалили или у вас нет доступа."
					action={
						<Button asChild data-testid="program-back-to-list">
							<Link to="/admin/programs">К списку программ</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const status = (program.status ?? "draft") as PublishStatus;

	const handlePublish = async (published: boolean) => {
		const next: PublishStatus = published ? "published" : "draft";
		await zero.mutate(
			mutators.publishProgram({ id: program.id, status: next }),
		);
	};

	const handlePublicChange = async (isPublic: boolean) => {
		await zero.mutate(
			mutators.updateProgram({ id: program.id, public: isPublic }),
		);
	};

	const handleUpdate = async (values: ProgramFormValues) => {
		await zero.mutate(
			mutators.updateProgram({
				id: program.id,
				title: values.title,
				description: values.description || null,
				examType: values.examType,
				subject: values.subject,
			}),
		);
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-program-detail"
		>
			<PageHeader
				title={program.title}
				description={
					program.description?.trim()
						? program.description
						: `${program.examType} · ${program.subject}`
				}
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin/programs"
							className="hover:text-foreground"
							data-testid="program-detail-list-link"
						>
							Программы
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">{program.title}</span>
					</nav>
				}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<StatusBadge
							status={status === "published" ? "published" : "draft"}
						/>
						<PublishToggle
							id={`program-detail-publish-${program.id}`}
							published={status === "published"}
							onPublishedChange={(published) => {
								void handlePublish(published);
							}}
						/>
						<PublishToggle
							id={`program-detail-public-${program.id}`}
							published={program.public ?? false}
							publishedLabel="Публичная"
							draftLabel="По приглашению"
							onPublishedChange={(isPublic) => {
								void handlePublicChange(isPublic);
							}}
						/>
						<Button
							variant="outline"
							data-testid="program-edit-open"
							onClick={() => setEditOpen(true)}
						>
							<PencilIcon />
							Редактировать
						</Button>
					</div>
				}
			/>

			<div
				className="rounded-xl border bg-card px-4 py-3 text-sm"
				data-testid="program-meta"
			>
				<p>
					<span className="text-muted-foreground">Экзамен:</span>{" "}
					{program.examType}
				</p>
				<p>
					<span className="text-muted-foreground">Предмет:</span>{" "}
					{program.subject}
				</p>
			</div>

			<TopicEditor programId={program.id} topics={program.topics ?? []} />

			<ProgramFormDialog
				key={program.id}
				open={editOpen}
				onOpenChange={setEditOpen}
				mode="edit"
				initial={{
					title: program.title,
					description: program.description ?? "",
					examType: program.examType,
					subject: program.subject,
				}}
				onSubmit={handleUpdate}
			/>
		</main>
	);
}
