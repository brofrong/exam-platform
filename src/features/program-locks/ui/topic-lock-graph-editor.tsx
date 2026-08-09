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

type TopicLockGraphEditorProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	programId: string;
	topics: ReadonlyArray<{ id: string; title: string; position: number }>;
	edges: ReadonlyArray<{
		id: string;
		blockerTopicId: string;
		topicId: string;
	}>;
};

export function TopicLockGraphEditor({
	open,
	onOpenChange,
	programId,
	topics,
	edges,
}: TopicLockGraphEditorProps) {
	const zero = useZero();
	const [saving, setSaving] = useState(false);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-4xl"
				data-testid="topic-lock-graph-dialog"
			>
				<DialogHeader>
					<DialogTitle>Зависимости тем</DialogTitle>
					<DialogDescription>
						Соедините темы: источник блокирует цель. Несколько входящих — нужны
						все. Без рёбер тема свободна.
					</DialogDescription>
				</DialogHeader>
				{open ? (
					<LockGraphCanvas
						nodes={topics.map((topic) => ({
							id: topic.id,
							label: topic.title,
							position: topic.position,
						}))}
						edges={edges.map((edge) => ({
							id: edge.id,
							from: edge.blockerTopicId,
							to: edge.topicId,
						}))}
						saving={saving}
						onSave={async (next) => {
							setSaving(true);
							try {
								await zero.mutate(
									mutators.setTopicLockEdges({
										programId,
										edges: next.map((edge) => ({
											blockerTopicId: edge.from,
											topicId: edge.to,
										})),
									}),
								);
								toast.success("Зависимости тем сохранены");
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
