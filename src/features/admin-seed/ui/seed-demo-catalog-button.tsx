import { DatabaseIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { seedDemoCatalog } from "#/features/admin-seed/server/seed-demo-catalog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SeedDemoButtonProps = {
	variant?: "sidebar" | "sheet";
	className?: string;
	onDone?: () => void;
};

/** Admin-only control to seed the ОГЭ/ЕГЭ demo catalog (idempotent). */
export function SeedDemoCatalogButton({
	variant = "sidebar",
	className,
	onDone,
}: SeedDemoButtonProps) {
	const [pending, setPending] = useState(false);

	const handleClick = async () => {
		if (pending) {
			return;
		}
		setPending(true);
		try {
			const result = await seedDemoCatalog();
			if (result.status === "created") {
				toast.success(
					`Создано: ${result.programs} программ, ${result.topics} тем, ${result.lessons} уроков, ${result.activities} активностей`,
				);
			} else if (result.status === "already_exists") {
				toast.message("Демо-каталог ОГЭ/ЕГЭ уже создан");
			} else if (result.status === "forbidden") {
				toast.error("Недостаточно прав");
			} else {
				toast.error("Нужно войти в аккаунт");
			}
			onDone?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Не удалось создать каталог",
			);
		} finally {
			setPending(false);
		}
	};

	if (variant === "sheet") {
		return (
			<Button
				type="button"
				variant="ghost"
				className={cn("h-auto justify-start gap-3 px-3 py-3", className)}
				data-testid="admin-seed-demo-catalog"
				disabled={pending}
				onClick={handleClick}
			>
				<span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
					{pending ? (
						<Loader2Icon className="size-4 animate-spin" />
					) : (
						<DatabaseIcon className="size-4" />
					)}
				</span>
				<span className="text-left">
					<span className="block font-medium">Демо-каталог ОГЭ/ЕГЭ</span>
					<span className="block text-xs font-normal text-muted-foreground">
						4 программы с темами, уроками и Mafs
					</span>
				</span>
			</Button>
		);
	}

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className={cn("w-full justify-start gap-2", className)}
			data-testid="admin-seed-demo-catalog"
			disabled={pending}
			onClick={handleClick}
		>
			{pending ? (
				<Loader2Icon className="size-4 animate-spin" />
			) : (
				<DatabaseIcon className="size-4" />
			)}
			{pending ? "Создание…" : "Демо-каталог ОГЭ/ЕГЭ"}
		</Button>
	);
}
