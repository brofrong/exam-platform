import { DatabaseIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { seedDemoCatalog } from "#/features/admin-seed/server/seed-demo-catalog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SeedDemoButtonProps = {
	variant?: "page";
	className?: string;
	onDone?: () => void;
};

/** Admin-only control to seed the ОГЭ/ЕГЭ demo catalog (idempotent). */
export function SeedDemoCatalogButton({
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

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className={cn("justify-start gap-2", className)}
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
