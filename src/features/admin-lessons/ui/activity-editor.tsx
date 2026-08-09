import { useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	FileJsonIcon,
	PlusIcon,
} from "lucide-react";
import { useState } from "react";
import { ACTIVITY_TYPES, type ActivityType } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { EmptyState, EntityRow } from "@/components/lms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type ActivityRow = {
	id: string;
	lessonId: string;
	type: string;
	position: number;
	content: unknown;
};

type ActivityEditorProps = {
	lessonId: string;
	activities: ReadonlyArray<ActivityRow>;
};

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
	theory: "Теория",
	practice: "Практика",
};

function asActivityType(type: string): ActivityType {
	return ACTIVITY_TYPES.includes(type as ActivityType)
		? (type as ActivityType)
		: "theory";
}

export function ActivityEditor({ lessonId, activities }: ActivityEditorProps) {
	const zero = useZero();
	const [createOpen, setCreateOpen] = useState(false);
	const [createType, setCreateType] = useState<ActivityType>("theory");

	const sorted = [...activities].sort((a, b) => a.position - b.position);

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();
		await zero.mutate(
			mutators.createActivity({
				id: crypto.randomUUID(),
				lessonId,
				type: createType,
				position: sorted.length,
			}),
		);
		setCreateOpen(false);
		setCreateType("theory");
	};

	const moveActivity = async (activityId: string, direction: -1 | 1) => {
		const index = sorted.findIndex((activity) => activity.id === activityId);
		const swapIndex = index + direction;
		if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) {
			return;
		}
		const orderedIds = sorted.map((activity) => activity.id);
		const current = orderedIds[index];
		const swap = orderedIds[swapIndex];
		if (current === undefined || swap === undefined) {
			return;
		}
		orderedIds[index] = swap;
		orderedIds[swapIndex] = current;
		await zero.mutate(mutators.reorderActivities({ lessonId, orderedIds }));
	};

	return (
		<section className="space-y-4" data-testid="activity-editor">
			<div className="flex items-center justify-between gap-3">
				<h2 className="font-heading text-lg font-medium">Активности</h2>
				<Button
					size="sm"
					data-testid="activity-create-open"
					onClick={() => setCreateOpen(true)}
				>
					<PlusIcon />
					Добавить
				</Button>
			</div>

			{sorted.length === 0 ? (
				<EmptyState
					icon={<FileJsonIcon />}
					title="Активностей пока нет"
					description="Добавьте теорию или практику (группа тестов)."
					action={
						<Button
							data-testid="activity-create-empty"
							onClick={() => setCreateOpen(true)}
						>
							<PlusIcon />
							Добавить активность
						</Button>
					}
				/>
			) : (
				<ul className="flex flex-col gap-2" data-testid="activities-list">
					{sorted.map((activity, index) => {
						const type = asActivityType(activity.type);
						const typeLabel = ACTIVITY_TYPE_LABELS[type];
						return (
							<li key={activity.id}>
								<EntityRow
									draggable
									title={typeLabel}
									subtitle={`Позиция ${activity.position + 1}`}
									status={
										<Badge
											variant="outline"
											data-testid={`activity-type-${activity.id}`}
										>
											{typeLabel}
										</Badge>
									}
									actions={
										<div className="flex flex-wrap items-center gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												data-testid={`activity-move-up-${activity.id}`}
												disabled={index === 0}
												onClick={() => void moveActivity(activity.id, -1)}
											>
												<ArrowUpIcon />
												<span className="sr-only">Выше</span>
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												data-testid={`activity-move-down-${activity.id}`}
												disabled={index === sorted.length - 1}
												onClick={() => void moveActivity(activity.id, 1)}
											>
												<ArrowDownIcon />
												<span className="sr-only">Ниже</span>
											</Button>
											<Button
												variant="outline"
												size="sm"
												asChild
												data-testid={`activity-edit-open-${activity.id}`}
											>
												<Link
													to="/admin/lessons/$lessonId/activities/$activityId"
													params={{
														lessonId,
														activityId: activity.id,
													}}
												>
													Редактировать
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

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent data-testid="activity-create-dialog">
					<form onSubmit={handleCreate} className="grid gap-4">
						<DialogHeader>
							<DialogTitle>Новая активность</DialogTitle>
							<DialogDescription>
								Теория или практика. Пустой TipTap-документ создаётся сразу.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-1.5">
							<Label>Тип</Label>
							<Select
								value={createType}
								onValueChange={(value) =>
									setCreateType((value as ActivityType) ?? "theory")
								}
							>
								<SelectTrigger
									className="w-full"
									data-testid="activity-type-select"
								>
									<SelectValue placeholder="Выберите тип" />
								</SelectTrigger>
								<SelectContent>
									{ACTIVITY_TYPES.map((type) => (
										<SelectItem key={type} value={type}>
											{ACTIVITY_TYPE_LABELS[type]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								data-testid="activity-create-cancel"
								onClick={() => setCreateOpen(false)}
							>
								Отмена
							</Button>
							<Button type="submit" data-testid="activity-create-submit">
								Создать
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</section>
	);
}
