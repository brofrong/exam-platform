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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type SelectTestGroupDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (groupId: string) => void;
};

type Mode = "choose" | "pick";

export function SelectTestGroupDialog({
	open,
	onOpenChange,
	onSelect,
}: SelectTestGroupDialogProps) {
	const zero = useZero();
	const navigate = useNavigate();
	const [mode, setMode] = useState<Mode>("choose");
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
	const [createTitle, setCreateTitle] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [groups] = useQuery(queries.testGroups());

	const sorted = useMemo(
		() =>
			[...(groups ?? [])].sort((a, b) => a.title.localeCompare(b.title, "ru")),
		[groups],
	);

	const reset = () => {
		setMode("choose");
		setSelectedGroupId(null);
		setCreateTitle("");
		setIsCreating(false);
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			reset();
		}
		onOpenChange(next);
	};

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();
		const title = createTitle.trim();
		if (!title || isCreating) {
			return;
		}
		setIsCreating(true);
		const id = crypto.randomUUID();
		try {
			await zero.mutate(
				mutators.createTestGroup({
					id,
					title,
					description: "",
				}),
			);
			handleOpenChange(false);
			await navigate({
				to: "/admin/tests/$groupId",
				params: { groupId: id },
			});
		} finally {
			setIsCreating(false);
		}
	};

	const handlePick = (event: React.FormEvent) => {
		event.preventDefault();
		if (!selectedGroupId) {
			return;
		}
		onSelect(selectedGroupId);
		handleOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent data-testid="select-test-group-dialog">
				{mode === "choose" ? (
					<div className="grid gap-4">
						<DialogHeader>
							<DialogTitle>Группа тестов</DialogTitle>
							<DialogDescription>
								Выберите существующую группу или создайте новую и перейдите к
								редактированию.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-2">
							<Button
								type="button"
								data-testid="select-test-group-create"
								onClick={() => setMode("pick")}
								variant="outline"
							>
								Выбрать существующую
							</Button>
							<form
								className="grid gap-2"
								onSubmit={(e) => void handleCreate(e)}
							>
								<Label htmlFor="new-test-group-title">Новая группа</Label>
								<Input
									id="new-test-group-title"
									value={createTitle}
									onChange={(e) => setCreateTitle(e.target.value)}
									placeholder="Например: Векторы"
									data-testid="select-test-group-title"
								/>
								<Button
									type="submit"
									disabled={!createTitle.trim() || isCreating}
									data-testid="select-test-group-create-submit"
								>
									{isCreating ? "Создаём…" : "Создать и редактировать"}
								</Button>
							</form>
						</div>
					</div>
				) : (
					<form className="grid gap-4" onSubmit={handlePick}>
						<DialogHeader>
							<DialogTitle>Выбрать группу</DialogTitle>
							<DialogDescription>
								Группа будет привязана к практике в этом уроке.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-2">
							<Label>Группа</Label>
							<Select
								value={selectedGroupId ?? undefined}
								onValueChange={setSelectedGroupId}
							>
								<SelectTrigger data-testid="select-test-group-picker">
									<SelectValue placeholder="Выберите группу" />
								</SelectTrigger>
								<SelectContent>
									{sorted.map((group) => (
										<SelectItem key={group.id} value={group.id}>
											{group.title}
											{group.status === "draft" ? " (черновик)" : ""}
											{` · ${group.tests?.length ?? 0} тестов`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<DialogFooter className="gap-2 sm:gap-0">
							<Button
								type="button"
								variant="outline"
								onClick={() => setMode("choose")}
							>
								Назад
							</Button>
							<Button
								type="submit"
								disabled={!selectedGroupId}
								data-testid="select-test-group-confirm"
							>
								Выбрать
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
