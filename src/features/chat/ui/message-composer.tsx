import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type MessageComposerProps = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (event: React.FormEvent) => void;
};

export function MessageComposer({
	value,
	onChange,
	onSubmit,
}: MessageComposerProps) {
	return (
		<form
			onSubmit={onSubmit}
			className="flex items-end gap-2 border-t border-border px-4 py-3 sm:px-6"
		>
			<Textarea
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Напишите сообщение..."
				rows={1}
				className="min-h-9 max-h-32 min-w-0 flex-1 resize-none"
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						event.currentTarget.form?.requestSubmit();
					}
				}}
			/>
			<Button type="submit" disabled={!value.trim()} size="default">
				<Send />
				Отправить
			</Button>
		</form>
	);
}

type NewChatFormProps = {
	title: string;
	onTitleChange: (value: string) => void;
	onSubmit: (event: React.FormEvent) => void;
	onCancel: () => void;
};

export function NewChatForm({
	title,
	onTitleChange,
	onSubmit,
	onCancel,
}: NewChatFormProps) {
	return (
		<form onSubmit={onSubmit} className="space-y-2">
			<Input
				value={title}
				onChange={(event) => onTitleChange(event.target.value)}
				placeholder="Название чата"
				autoFocus
			/>
			<div className="flex gap-2">
				<Button type="submit" size="sm">
					Создать
				</Button>
				<Button type="button" variant="outline" size="sm" onClick={onCancel}>
					Отмена
				</Button>
			</div>
		</form>
	);
}
