"use client";

import type * as React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConfirmActionDialogProps = {
	trigger: React.ReactNode;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	destructive?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

function ConfirmActionDialog({
	trigger,
	title,
	description,
	confirmLabel = "Подтвердить",
	cancelLabel = "Отмена",
	onConfirm,
	destructive = false,
	open,
	onOpenChange,
}: ConfirmActionDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			<AlertDialogContent data-testid="confirm-action-dialog">
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel data-testid="confirm-action-cancel">
						{cancelLabel}
					</AlertDialogCancel>
					<AlertDialogAction
						variant={destructive ? "destructive" : "default"}
						data-testid="confirm-action-confirm"
						onClick={onConfirm}
					>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export { ConfirmActionDialog };
export type { ConfirmActionDialogProps };
