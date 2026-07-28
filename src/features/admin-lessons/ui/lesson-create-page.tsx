import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LessonCreateSearch = {
	programId?: string;
	topicId?: string;
};

export function LessonCreatePage({
	programId,
	topicId,
}: {
	programId?: string;
	topicId?: string;
}) {
	const zero = useZero();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [saving, setSaving] = useState(false);
	const [topicLinks] = useQuery(
		topicId ? queries.topicLessonsByTopic({ topicId }) : undefined,
	);

	const canLink = Boolean(programId && topicId);
	const linkPosition = topicLinks?.length ?? 0;

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const trimmed = title.trim();
		if (!trimmed || saving) {
			return;
		}
		setSaving(true);
		const id = crypto.randomUUID();
		try {
			await zero.mutate(
				mutators.createLesson({
					id,
					title: trimmed,
					homeProgramId: programId,
					homeTopicId: topicId,
					linkTopicId: topicId,
					linkPosition,
				}),
			);
			if (programId && topicId) {
				const isDesktop =
					typeof window !== "undefined" &&
					window.matchMedia("(min-width: 768px)").matches;
				if (isDesktop) {
					await navigate({
						to: "/admin/programs/$programId",
						params: { programId },
						search: { topic: topicId, lesson: id },
					});
				} else {
					await navigate({
						to: "/admin/lessons/$lessonId",
						params: { lessonId: id },
					});
				}
			} else {
				await navigate({
					to: "/admin/lessons/$lessonId",
					params: { lessonId: id },
				});
			}
		} finally {
			setSaving(false);
		}
	};

	return (
		<main
			className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-10"
			data-testid="admin-lesson-create"
		>
			<PageHeader
				title="Новый урок"
				description={
					canLink
						? "Урок будет привязан к выбранной теме и получит её как домашнюю."
						: "Создайте урок. Привязку к теме можно сделать позже."
				}
				breadcrumbs={
					<nav className="text-sm">
						{programId ? (
							<>
								<Link
									to="/admin/programs/$programId"
									params={{ programId }}
									search={topicId ? { topic: topicId } : {}}
									className="hover:text-foreground"
								>
									Программа
								</Link>
								<span className="mx-1.5">/</span>
							</>
						) : null}
						<span className="text-foreground">Новый урок</span>
					</nav>
				}
			/>

			<form onSubmit={handleSubmit} className="grid gap-4">
				<div className="space-y-1.5">
					<Label htmlFor="lesson-create-title">Название</Label>
					<Input
						id="lesson-create-title"
						data-testid="lesson-create-title"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="Например, Квадратные уравнения"
						required
						autoFocus
					/>
				</div>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => void navigate({ to: "/admin/programs" })}
					>
						Отмена
					</Button>
					<Button
						type="submit"
						data-testid="lesson-create-submit"
						disabled={!title.trim() || saving}
					>
						Создать
					</Button>
				</div>
			</form>
		</main>
	);
}
