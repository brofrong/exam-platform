"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type PublishToggleProps = {
	published: boolean;
	onPublishedChange: (published: boolean) => void;
	disabled?: boolean;
	id?: string;
	publishedLabel?: string;
	draftLabel?: string;
	className?: string;
};

function PublishToggle({
	published,
	onPublishedChange,
	disabled = false,
	id = "publish-toggle",
	publishedLabel = "Опубликовано",
	draftLabel = "Черновик",
	className,
}: PublishToggleProps) {
	return (
		<div
			data-slot="publish-toggle"
			className={cn("flex items-center gap-2", className)}
		>
			<Switch
				id={id}
				checked={published}
				disabled={disabled}
				data-testid={id}
				onCheckedChange={onPublishedChange}
			/>
			<Label htmlFor={id} className="cursor-pointer">
				{published ? publishedLabel : draftLabel}
			</Label>
		</div>
	);
}

export { PublishToggle };
export type { PublishToggleProps };
