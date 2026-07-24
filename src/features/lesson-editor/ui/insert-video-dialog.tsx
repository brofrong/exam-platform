import type { Editor } from "@tiptap/react";
import { VideoIcon } from "lucide-react";
import { useState } from "react";
import { parseVideoUrl } from "#/features/lesson-editor/lib/parse-video-url";
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

type InsertVideoDialogProps = {
	editor: Editor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function InsertVideoDialog({
	editor,
	open,
	onOpenChange,
}: InsertVideoDialogProps) {
	const [url, setUrl] = useState("");
	const [error, setError] = useState<string | null>(null);

	function reset() {
		setUrl("");
		setError(null);
	}

	function handleOpenChange(next: boolean) {
		if (!next) {
			reset();
		}
		onOpenChange(next);
	}

	function handleInsert() {
		const parsed = parseVideoUrl(url);
		if (!parsed) {
			setError(
				"Не удалось распознать ссылку. Поддерживаются VK Video и YouTube.",
			);
			return;
		}
		editor.chain().focus().insertVideo(parsed).run();
		handleOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent data-testid="theory-insert-video-dialog">
				<DialogHeader>
					<DialogTitle>Вставить видео</DialogTitle>
					<DialogDescription>
						Вставьте ссылку на VK Video или YouTube — блок появится в тексте
						урока.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<Label htmlFor="theory-video-url">Ссылка на видео</Label>
					<Input
						id="theory-video-url"
						type="url"
						placeholder="https://vk.com/video-…"
						value={url}
						onChange={(event) => {
							setUrl(event.target.value);
							if (error) {
								setError(null);
							}
						}}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								handleInsert();
							}
						}}
						data-testid="theory-insert-video-url"
						autoFocus
					/>
					{error ? (
						<p
							className="text-sm text-destructive"
							data-testid="theory-insert-video-error"
						>
							{error}
						</p>
					) : null}
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						data-testid="theory-insert-video-cancel"
					>
						Отмена
					</Button>
					<Button
						type="button"
						onClick={handleInsert}
						data-testid="theory-insert-video-submit"
					>
						Вставить
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

type InsertVideoButtonProps = {
	editor: Editor;
};

export function InsertVideoButton({ editor }: InsertVideoButtonProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label="Вставить видео"
				data-testid="theory-toolbar-video"
				onClick={() => setOpen(true)}
			>
				<VideoIcon />
			</Button>
			<InsertVideoDialog editor={editor} open={open} onOpenChange={setOpen} />
		</>
	);
}
