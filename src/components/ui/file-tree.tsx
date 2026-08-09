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
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";

type TreeContextValue = {
	selectedId: string | undefined;
	expandedIds: Set<string>;
	toggleExpand: (id: string) => void;
	expand: (id: string) => void;
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
	const isControlled = expandedIdsProp !== undefined;
	const onExpandedChangeRef = useRef(onExpandedChange);
	onExpandedChangeRef.current = onExpandedChange;

	const [internalExpanded, setInternalExpanded] = useState(
		() => new Set(defaultExpandedIds ?? []),
	);

	const expandedIds = useMemo(() => {
		if (expandedIdsProp) {
			return new Set(expandedIdsProp);
		}
		return internalExpanded;
	}, [expandedIdsProp, internalExpanded]);

	const setExpanded = useCallback(
		(next: Set<string>) => {
			if (isControlled) {
				onExpandedChangeRef.current?.([...next]);
			} else {
				setInternalExpanded(next);
				onExpandedChangeRef.current?.([...next]);
			}
		},
		[isControlled],
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

	const expand = useCallback(
		(id: string) => {
			if (expandedIds.has(id)) {
				return;
			}
			const next = new Set(expandedIds);
			next.add(id);
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

	const contextValue = useMemo(
		() => ({ selectedId, expandedIds, toggleExpand, expand, select }),
		[selectedId, expandedIds, toggleExpand, expand, select],
	);

	return (
		<TreeContext.Provider value={contextValue}>
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
	const { selectedId, expandedIds, toggleExpand, expand, select } = useTree();
	const open = expandedIds.has(value);
	const selected = selectedId === value;

	return (
		<div>
			<div
				className={cn(
					"flex w-full items-center gap-0.5 rounded-md transition-colors hover:bg-muted/80",
					selected && "bg-muted font-medium",
					className,
				)}
			>
				<button
					type="button"
					aria-label={open ? "Свернуть" : "Развернуть"}
					aria-expanded={open}
					data-testid={`tree-folder-toggle-${value}`}
					className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
					onClick={() => toggleExpand(value)}
				>
					<ChevronRightIcon
						className={cn("size-3.5 transition-transform", open && "rotate-90")}
					/>
				</button>
				<button
					type="button"
					aria-pressed={selected}
					data-testid={`tree-folder-${value}`}
					className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 pr-2 text-left"
					onClick={() => {
						select(value);
						// Select must not collapse — that caused expand flicker on navigate.
						expand(value);
					}}
				>
					{open ? (
						<FolderOpenIcon className="size-4 shrink-0 text-muted-foreground" />
					) : (
						<FolderIcon className="size-4 shrink-0 text-muted-foreground" />
					)}
					<span className="truncate">{element}</span>
				</button>
			</div>
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
