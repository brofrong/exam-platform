import {
	ChevronRightIcon,
	FileIcon,
	FolderIcon,
	FolderOpenIcon,
} from "lucide-react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import { cn } from "@/lib/utils";

type TreeContextValue = {
	selectedId: string | undefined;
	expandedIds: Set<string>;
	toggleExpand: (id: string) => void;
	select: (id: string) => void;
};

const TreeContext = createContext<TreeContextValue | null>(null);

function useTree() {
	const ctx = useContext(TreeContext);
	if (!ctx) {
		throw new Error("File tree components must be used within Tree");
	}
	return ctx;
}

export function Tree({
	className,
	selectedId,
	onSelect,
	expandedIds: expandedIdsProp,
	defaultExpandedIds,
	onExpandedChange,
	children,
}: {
	className?: string;
	selectedId?: string;
	onSelect?: (id: string) => void;
	expandedIds?: string[];
	defaultExpandedIds?: string[];
	onExpandedChange?: (ids: string[]) => void;
	children: ReactNode;
}) {
	const [internalExpanded, setInternalExpanded] = useState(
		() => new Set(defaultExpandedIds ?? []),
	);
	const expandedIds = expandedIdsProp
		? new Set(expandedIdsProp)
		: internalExpanded;

	const setExpanded = useCallback(
		(next: Set<string>) => {
			if (expandedIdsProp) {
				onExpandedChange?.([...next]);
			} else {
				setInternalExpanded(next);
				onExpandedChange?.([...next]);
			}
		},
		[expandedIdsProp, onExpandedChange],
	);

	const toggleExpand = useCallback(
		(id: string) => {
			const next = new Set(expandedIds);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			setExpanded(next);
		},
		[expandedIds, setExpanded],
	);

	const select = useCallback(
		(id: string) => {
			onSelect?.(id);
		},
		[onSelect],
	);

	return (
		<TreeContext.Provider
			value={{ selectedId, expandedIds, toggleExpand, select }}
		>
			<div
				className={cn("flex flex-col gap-0.5 text-sm", className)}
				data-testid="file-tree"
			>
				{children}
			</div>
		</TreeContext.Provider>
	);
}

export function Folder({
	value,
	element,
	children,
	className,
}: {
	value: string;
	element: string;
	children?: ReactNode;
	className?: string;
}) {
	const { selectedId, expandedIds, toggleExpand, select } = useTree();
	const open = expandedIds.has(value);
	const selected = selectedId === value;

	return (
		<div>
			<button
				type="button"
				aria-expanded={open}
				aria-pressed={selected}
				data-testid={`tree-folder-${value}`}
				className={cn(
					"flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/80",
					selected && "bg-muted font-medium",
					className,
				)}
				onClick={() => {
					select(value);
					toggleExpand(value);
				}}
			>
				<ChevronRightIcon
					className={cn(
						"size-3.5 shrink-0 text-muted-foreground transition-transform",
						open && "rotate-90",
					)}
				/>
				{open ? (
					<FolderOpenIcon className="size-4 shrink-0 text-muted-foreground" />
				) : (
					<FolderIcon className="size-4 shrink-0 text-muted-foreground" />
				)}
				<span className="truncate">{element}</span>
			</button>
			{open ? (
				<div className="ml-3 border-l border-border/70 pl-2">{children}</div>
			) : null}
		</div>
	);
}

export function File({
	value,
	children,
	className,
}: {
	value: string;
	children: ReactNode;
	className?: string;
}) {
	const { selectedId, select } = useTree();
	const selected = selectedId === value;

	return (
		<button
			type="button"
			aria-pressed={selected}
			data-testid={`tree-file-${value}`}
			className={cn(
				"flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/80",
				selected && "bg-muted font-medium",
				className,
			)}
			onClick={() => select(value)}
		>
			<span className="size-3.5 shrink-0" />
			<FileIcon className="size-4 shrink-0 text-muted-foreground" />
			<span className="truncate">{children}</span>
		</button>
	);
}
