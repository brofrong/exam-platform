import type { Editor } from "@tiptap/react";
import { ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadEditorImage } from "#/features/lesson-editor/lib/upload-editor-image";
import { Button } from "@/components/ui/button";

type InsertImageButtonProps = {
	editor: Editor;
};

export function InsertImageButton({ editor }: InsertImageButtonProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);

	async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) {
			return;
		}

		setUploading(true);
		try {
			const src = await uploadEditorImage(file);
			editor.chain().focus().setImage({ src, alt: file.name }).run();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Не удалось загрузить изображение",
			);
		} finally {
			setUploading(false);
		}
	}

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/gif,image/webp"
				className="sr-only"
				tabIndex={-1}
				data-testid="theory-toolbar-image-input"
				onChange={onFileChange}
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label="Вставить изображение"
				disabled={uploading}
				data-testid="theory-toolbar-image"
				onClick={() => inputRef.current?.click()}
			>
				<ImageIcon />
			</Button>
		</>
	);
}
