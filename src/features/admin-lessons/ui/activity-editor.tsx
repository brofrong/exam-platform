import { useZero } from "@rocicorp/zero/react";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	FileJsonIcon,
	PlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
	emptyTheoryDoc,
	normalizeTheoryDoc,
	type TheoryDoc,
	TheoryEditor,
	toActivityContent,
} from "#/features/lesson-editor";
import {
	ACTIVITY_TYPES,
	type ActivityType,
	EMPTY_TIPTAP_DOC,
} from "#/server/zero/constants";
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
import { Textarea } from "@/components/ui/textarea";

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

const activityContentSchema = z.record(z.string(), z.json());
type ActivityContent = z.infer<typeof activityContentSchema>;

function formatContentJson(content: unknown): string {
	try {
		return JSON.stringify(content ?? EMPTY_TIPTAP_DOC, null, 2);
	} catch {
		return JSON.stringify(EMPTY_TIPTAP_DOC, null, 2);
	}
}

function parseContentJson(
	raw: string,
): { ok: true; value: ActivityContent } | { ok: false; error: string } {
	try {
		const parsed: unknown = JSON.parse(raw);
		const result = activityContentSchema.safeParse(parsed);
		if (!result.success) {
			return { ok: false, error: "Контент должен быть JSON-объектом TipTap" };
		}
		return { ok: true, value: result.data };
	} catch {
		return { ok: false, error: "Невалидный JSON" };
	}
}

function asActivityType(type: string): ActivityType {
	return ACTIVITY_TYPES.includes(type as ActivityType)
		? (type as ActivityType)
		: "theory";
}

export function ActivityEditor({ lessonId, activities }: ActivityEditorProps) {
	const zero = useZero();
	const [createOpen, setCreateOpen] = useState(false);
	const [createType, setCreateType] = useState<ActivityType>("theory");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [theoryDraft, setTheoryDraft] = useState<TheoryDoc>(emptyTheoryDoc);
	const [jsonDraft, setJsonDraft] = useState("");
	const [contentError, setContentError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const sorted = [...activities].sort((a, b) => a.position - b.position);
	const editing = sorted.find((activity) => activity.id === editingId) ?? null;
	const editingType = editing ? asActivityType(editing.type) : null;

	useEffect(() => {
		if (!editing) {
			return;
		}
		if (asActivityType(editing.type) === "theory") {
			setTheoryDraft(normalizeTheoryDoc(editing.content));
		} else {
			setJsonDraft(formatContentJson(editing.content));
		}
		setContentError(null);
		setIsSaving(false);
	}, [editing]);

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

	const handleSaveContent = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!editing || isSaving || !editingType) {
			return;
		}

		let content: ActivityContent;
		if (editingType === "theory") {
			const parsed = activityContentSchema.safeParse(
				toActivityContent(theoryDraft),
			);
			if (!parsed.success) {
				setContentError("Контент редактора невалиден");
				return;
			}
			content = parsed.data;
		} else {
			const parsed = parseContentJson(jsonDraft);
			if (!parsed.ok) {
				setContentError(parsed.error);
				return;
			}
			content = parsed.value;
		}

		setIsSaving(true);
		setContentError(null);
		try {
			await zero.mutate(
				mutators.updateActivity({
					id: editing.id,
					content,
				}),
			);
			setEditingId(null);
		} catch {
			setContentError("Не удалось сохранить контент");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<section className="space-y-4" data-testid="activity-editor">
			<div className="flex items-center justify-between gap-3">
				<h2 className="font-heading text-lg font-medium">Activities</h2>
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
					title="Activities пока нет"
					description="Добавьте теорию или практику. Теория редактируется в TipTap; практика пока через JSON."
					action={
						<Button
							data-testid="activity-create-empty"
							onClick={() => setCreateOpen(true)}
						>
							<PlusIcon />
							Добавить activity
						</Button>
					}
				/>
			) : (
				<ul className="flex flex-col gap-2" data-testid="activities-list">
					{sorted.map((activity, index) => {
						const type = asActivityType(activity.type);
						return (
							<li key={activity.id}>
								<EntityRow
									draggable
									title={ACTIVITY_TYPE_LABELS[type]}
									subtitle={`Позиция ${activity.position + 1}`}
									status={
										<Badge
											variant="outline"
											data-testid={`activity-type-${activity.id}`}
										>
											{type}
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
												data-testid={`activity-edit-open-${activity.id}`}
												onClick={() => setEditingId(activity.id)}
											>
												{type === "theory" ? "Редактор" : "JSON"}
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
							<DialogTitle>Новый activity</DialogTitle>
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

			<Dialog
				open={editingId !== null}
				onOpenChange={(open) => {
					if (!open) {
						setEditingId(null);
						setContentError(null);
					}
				}}
			>
				<DialogContent
					className={editingType === "theory" ? "sm:max-w-3xl" : "sm:max-w-xl"}
					data-testid="activity-content-dialog"
				>
					<form onSubmit={handleSaveContent} className="grid gap-4">
						<DialogHeader>
							<DialogTitle>
								{editingType === "theory"
									? "Редактор теории"
									: "Контент TipTap (JSON)"}
							</DialogTitle>
							<DialogDescription>
								{editingType === "theory"
									? "WYSIWYG TipTap. Сохраняется в activity.content."
									: "Практика пока редактируется как JSON (полный редактор — Task 19)."}
							</DialogDescription>
						</DialogHeader>
						{editingType === "theory" && editing ? (
							<TheoryEditor
								key={editing.id}
								content={theoryDraft}
								onChange={setTheoryDraft}
							/>
						) : (
							<div className="space-y-1.5">
								<Label htmlFor="activity-content-json">JSON</Label>
								<Textarea
									id="activity-content-json"
									data-testid="activity-content-json"
									value={jsonDraft}
									onChange={(event) => setJsonDraft(event.target.value)}
									rows={16}
									className="font-mono text-xs"
									spellCheck={false}
								/>
							</div>
						)}
						{contentError ? (
							<p className="text-sm text-destructive">{contentError}</p>
						) : null}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								data-testid="activity-content-cancel"
								onClick={() => setEditingId(null)}
							>
								Отмена
							</Button>
							<Button
								type="submit"
								data-testid="activity-content-submit"
								disabled={isSaving}
							>
								{isSaving ? "Сохраняем…" : "Сохранить"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</section>
	);
}
