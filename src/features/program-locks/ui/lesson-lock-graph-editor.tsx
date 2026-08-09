import { useZero } from "@rocicorp/zero/react";
import { useState } from "react";
import { toast } from "sonner";
import { LockGraphCanvas } from "#/features/program-locks/ui/lock-graph-canvas";
import { mutators } from "#/server/zero/mutators";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type LessonLockGraphEditorProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	programId: string;
	topicId: string;
	topicTitle: string;
	lessons: ReadonlyArray<{ id: string; title: string; position: number }>;
	edges: ReadonlyArray<{
		id: string;
		blockerLessonId: string;
		lessonId: string;
	}>;
};

export function LessonLockGraphEditor({
	open,
	onOpenChange,
	programId,
	topicId,
	topicTitle,
	lessons,
	edges,
}: LessonLockGraphEditorProps) {
	const zero = useZero();
	const [saving, setSaving] = useState(false);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-4xl"
				data-testid="lesson-lock-graph-dialog"
			>
				<DialogHeader>
					<DialogTitle>Зависимости уроков — {topicTitle}</DialogTitle>
					<DialogDescription>
						Только уроки этой темы. Источник блокирует цель до порога прогресса.
					</DialogDescription>
				</DialogHeader>
				{open ? (
					<LockGraphCanvas
						nodes={lessons.map((lesson) => ({
							id: lesson.id,
							label: lesson.title,
							position: lesson.position,
						}))}
						edges={edges.map((edge) => ({
							id: edge.id,
							from: edge.blockerLessonId,
							to: edge.lessonId,
						}))}
						saving={saving}
						onSave={async (next) => {
							setSaving(true);
							try {
								await zero.mutate(
									mutators.setLessonLockEdges({
										programId,
										topicId,
										edges: next.map((edge) => ({
											blockerLessonId: edge.from,
											lessonId: edge.to,
										})),
									}),
								);
								toast.success("Зависимости уроков сохранены");
								onOpenChange(false);
							} catch (error) {
								toast.error(
									error instanceof Error
										? error.message
										: "Не удалось сохранить граф",
								);
							} finally {
								setSaving(false);
							}
						}}
					/>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
