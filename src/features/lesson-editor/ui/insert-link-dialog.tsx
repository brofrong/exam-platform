import type { Editor } from "@tiptap/react";
import { LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
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

type InsertLinkDialogProps = {
	editor: Editor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

function normalizeHref(raw: string): string | null {
	const trimmed = raw.trim();
	if (!trimmed) {
		return null;
	}
	if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
		return trimmed;
	}
	if (trimmed.includes(".") && !trimmed.includes(" ")) {
		return `https://${trimmed}`;
	}
	return trimmed;
}

export function InsertLinkDialog({
	editor,
	open,
	onOpenChange,
}: InsertLinkDialogProps) {
	const [url, setUrl] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			return;
		}
		const previous = editor.getAttributes("link").href;
		setUrl(typeof previous === "string" ? previous : "");
		setError(null);
	}, [open, editor]);

	function handleOpenChange(next: boolean) {
		if (!next) {
			setUrl("");
			setError(null);
		}
		onOpenChange(next);
	}

	function handleApply() {
		const href = normalizeHref(url);
		if (!href) {
			setError("Укажите ссылку");
			return;
		}
		editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
		handleOpenChange(false);
	}

	function handleRemove() {
		editor.chain().focus().extendMarkRange("link").unsetLink().run();
		handleOpenChange(false);
	}

	const hasLink = editor.isActive("link");

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent data-testid="theory-insert-link-dialog">
				<DialogHeader>
					<DialogTitle>
						{hasLink ? "Изменить ссылку" : "Вставить ссылку"}
					</DialogTitle>
					<DialogDescription>
						Выделите текст и укажите URL. Можно вставить с https:// или относи
						путь.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<Label htmlFor="theory-link-url">URL</Label>
					<Input
						id="theory-link-url"
						type="url"
						placeholder="https://…"
						value={url}
						data-testid="theory-link-url-input"
						onChange={(event) => {
							setUrl(event.target.value);
							if (error) {
								setError(null);
							}
						}}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								handleApply();
							}
						}}
					/>
					{error ? (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					) : null}
				</div>
				<DialogFooter className="gap-2 sm:justify-between">
					{hasLink ? (
						<Button
							type="button"
							variant="ghost"
							data-testid="theory-link-remove"
							onClick={handleRemove}
						>
							Убрать ссылку
						</Button>
					) : (
						<span />
					)}
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
						>
							Отмена
						</Button>
						<Button
							type="button"
							data-testid="theory-link-apply"
							onClick={handleApply}
						>
							Применить
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function InsertLinkButton({ editor }: { editor: Editor }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label="Ссылка"
				aria-pressed={editor.isActive("link")}
				data-testid="theory-toolbar-link"
				className={
					editor.isActive("link") ? "bg-muted text-foreground" : undefined
				}
				onClick={() => setOpen(true)}
			>
				<LinkIcon />
			</Button>
			<InsertLinkDialog editor={editor} open={open} onOpenChange={setOpen} />
		</>
	);
}
