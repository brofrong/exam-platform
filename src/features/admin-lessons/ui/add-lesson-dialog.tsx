import { useQuery, useZero } from "@rocicorp/zero/react";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
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

type AddLessonDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	programId: string;
	topicId: string;
	/** Lessons already linked to this topic (excluded from picker). */
	linkedLessonIds?: ReadonlyArray<string>;
	nextPosition: number;
};

type Mode = "choose" | "pick";

export function AddLessonDialog({
	open,
	onOpenChange,
	programId,
	topicId,
	linkedLessonIds = [],
	nextPosition,
}: AddLessonDialogProps) {
	const zero = useZero();
	const navigate = useNavigate();
	const [mode, setMode] = useState<Mode>("choose");
	const [filterHome, setFilterHome] = useState<"all" | "program" | "topic">(
		"program",
	);
	const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

	const homeArgs = useMemo(() => {
		if (filterHome === "topic") {
			return { homeProgramId: programId, homeTopicId: topicId };
		}
		if (filterHome === "program") {
			return { homeProgramId: programId };
		}
		return {};
	}, [filterHome, programId, topicId]);

	const [lessons] = useQuery(queries.lessonsByHome(homeArgs));
	const linked = useMemo(() => new Set(linkedLessonIds), [linkedLessonIds]);
	const available = (lessons ?? []).filter((lesson) => !linked.has(lesson.id));

	const reset = () => {
		setMode("choose");
		setFilterHome("program");
		setSelectedLessonId(null);
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			reset();
		}
		onOpenChange(next);
	};

	const handleCreateNew = async () => {
		handleOpenChange(false);
		await navigate({
			to: "/admin/lessons/new",
			search: { programId, topicId },
		});
	};

	const handleLink = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!selectedLessonId) {
			return;
		}
		await zero.mutate(
			mutators.linkTopicLesson({
				topicId,
				lessonId: selectedLessonId,
				position: nextPosition,
			}),
		);
		handleOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent data-testid="add-lesson-dialog">
				{mode === "choose" ? (
					<div className="grid gap-4">
						<DialogHeader>
							<DialogTitle>Добавить урок</DialogTitle>
							<DialogDescription>
								Создайте новый урок в этой теме или выберите уже существующий.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-2">
							<Button
								type="button"
								data-testid="add-lesson-create-new"
								onClick={() => void handleCreateNew()}
							>
								Создать новый
							</Button>
							<Button
								type="button"
								variant="outline"
								data-testid="add-lesson-pick-existing"
								onClick={() => setMode("pick")}
							>
								Выбрать существующий
							</Button>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="ghost"
								onClick={() => handleOpenChange(false)}
							>
								Отмена
							</Button>
						</DialogFooter>
					</div>
				) : (
					<form onSubmit={handleLink} className="grid gap-4">
						<DialogHeader>
							<DialogTitle>Выбрать урок</DialogTitle>
							<DialogDescription>
								Фильтр по «домашней» программе или теме помогает найти нужный
								урок.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-1.5">
							<Label>Фильтр</Label>
							<Select
								value={filterHome}
								onValueChange={(value) => {
									setFilterHome(value as "all" | "program" | "topic");
									setSelectedLessonId(null);
								}}
							>
								<SelectTrigger
									className="w-full"
									data-testid="add-lesson-filter"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="program">Эта программа</SelectItem>
									<SelectItem value="topic">Эта тема</SelectItem>
									<SelectItem value="all">Все уроки</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{available.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								Нет доступных уроков для привязки с таким фильтром.
							</p>
						) : (
							<div className="space-y-1.5">
								<Label>Урок</Label>
								<Select
									value={selectedLessonId ?? undefined}
									onValueChange={setSelectedLessonId}
								>
									<SelectTrigger
										className="w-full"
										data-testid="add-lesson-select"
									>
										<SelectValue placeholder="Выберите урок" />
									</SelectTrigger>
									<SelectContent>
										{available.map((lesson) => (
											<SelectItem key={lesson.id} value={lesson.id}>
												{lesson.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setMode("choose")}
							>
								Назад
							</Button>
							<Button
								type="submit"
								data-testid="add-lesson-link-submit"
								disabled={!selectedLessonId}
							>
								Привязать
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
