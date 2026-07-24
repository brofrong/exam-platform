import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import * as React from "react";
import { useEffect, useId, useState } from "react";
import { LiveError, LivePreview, LiveProvider } from "react-live";
import { isolateNodeViewClipboard } from "#/features/lesson-editor/lib/grip-only-stop-event";
import { prepareLiveReactCode } from "#/features/lesson-editor/lib/prepare-live-react-code";
import { NodeDragHandle } from "#/features/lesson-editor/ui/node-drag-handle";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Whitelist passed into react-live `scope`.
 *
 * Allowed (v1):
 * - React (hooks via React.useState etc.)
 * - Mafs, Coordinates, Plot, Theme — required for the sine-plot sample
 * - Line, Point, Vector, Transform, vec, useMovablePoint — safe Mafs diagram helpers
 *
 * Not allowed: fetch, document, window, arbitrary DOM outside the preview root.
 * Authoring is admin-only; student clients only evaluate stored TipTap JSON.
 * Documented also on /dev → Theory Editor.
 */
export type LiveReactScope = {
	React: typeof React;
	Mafs: unknown;
	Coordinates: unknown;
	Plot: unknown;
	Theme: unknown;
	Line: unknown;
	Point: unknown;
	Vector: unknown;
	Transform: unknown;
	vec: unknown;
	useMovablePoint: unknown;
};

async function loadLiveReactScope(): Promise<LiveReactScope> {
	const [mafs] = await Promise.all([import("mafs"), import("mafs/core.css")]);

	return {
		React,
		Mafs: mafs.Mafs,
		Coordinates: mafs.Coordinates,
		Plot: mafs.Plot,
		Theme: mafs.Theme,
		Line: mafs.Line,
		Point: mafs.Point,
		Vector: mafs.Vector,
		Transform: mafs.Transform,
		vec: mafs.vec,
		useMovablePoint: mafs.useMovablePoint,
	};
}

type LiveReactMode = "edit" | "preview";

export type LiveReactBlockProps = {
	code: string;
	className?: string;
	/**
	 * When set, shows Edit/Preview switch. Typing updates local draft only;
	 * this callback runs on blur or when switching to Preview (TipTap attrs).
	 */
	onCodeChange?: (code: string) => void;
};

function LiveReactPreviewPane({ code }: { code: string }) {
	const [scope, setScope] = useState<LiveReactScope | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		loadLiveReactScope()
			.then((next) => {
				if (!cancelled) {
					setScope(next);
				}
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					setLoadError(
						error instanceof Error
							? error.message
							: "Не удалось загрузить Mafs",
					);
				}
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const prepared = prepareLiveReactCode(code);

	return (
		<div
			className="min-h-48 bg-muted/30 p-2"
			data-testid="theory-live-react-preview-pane"
		>
			{loadError ? (
				<p
					className="px-2 py-6 text-center text-sm text-destructive"
					data-testid="theory-live-react-load-error"
				>
					{loadError}
				</p>
			) : !scope ? (
				<p
					className="px-2 py-6 text-center text-sm text-muted-foreground"
					data-testid="theory-live-react-loading"
				>
					Загрузка интерактива…
				</p>
			) : (
				<LiveProvider code={prepared} scope={scope} noInline language="tsx">
					<LivePreview
						className="live-react-preview w-full select-none overflow-auto"
						data-testid="theory-live-react-preview"
					/>
					<LiveError
						className="mt-2 block whitespace-pre-wrap rounded-md bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive"
						data-testid="theory-live-react-error"
					/>
				</LiveProvider>
			)}
		</div>
	);
}

export function LiveReactBlock({
	code,
	className,
	onCodeChange,
}: LiveReactBlockProps) {
	const sourceId = useId();
	const switchId = useId();
	const editable = Boolean(onCodeChange);
	const [mode, setMode] = useState<LiveReactMode>(
		editable ? "edit" : "preview",
	);
	const [draft, setDraft] = useState(code);

	useEffect(() => {
		setDraft(code);
	}, [code]);

	const commitDraft = (next: string = draft) => {
		if (!onCodeChange) {
			return;
		}
		if (next !== code) {
			onCodeChange(next);
		}
	};

	const showPreview = !editable || mode === "preview";
	const showEditor = editable && mode === "edit";

	return (
		<div
			className={cn(
				"overflow-hidden rounded-xl border border-border bg-background",
				className,
			)}
			data-testid="theory-live-react-block"
		>
			{editable ? (
				<div className="flex select-none items-center justify-between gap-3 border-b border-border px-3 py-2">
					<div className="flex min-w-0 items-center gap-2">
						<NodeDragHandle
							label="Переместить блок LiveReact"
							data-testid="theory-live-react-drag-handle"
						/>
						<p className="truncate text-xs text-muted-foreground">
							LiveReact · {mode === "edit" ? "Редактор" : "Превью"} · scope:
							React, Mafs, Coordinates, Plot, Theme, …
						</p>
					</div>
					<div className="flex items-center gap-2">
						<span
							className={cn(
								"text-xs",
								mode === "edit"
									? "font-medium text-foreground"
									: "text-muted-foreground",
							)}
						>
							Редактор
						</span>
						<Switch
							id={switchId}
							checked={mode === "preview"}
							onCheckedChange={(checked) => {
								if (checked) {
									commitDraft();
									setMode("preview");
								} else {
									setMode("edit");
								}
							}}
							data-testid="theory-live-react-mode-switch"
							aria-label="Переключить превью"
						/>
						<Label
							htmlFor={switchId}
							className={cn(
								"cursor-pointer text-xs",
								mode === "preview"
									? "font-medium text-foreground"
									: "text-muted-foreground",
							)}
						>
							Превью
						</Label>
					</div>
				</div>
			) : null}

			{showEditor ? (
				<div className="p-2" data-testid="theory-live-react-edit-pane">
					<label htmlFor={sourceId} className="sr-only">
						Исходный код liveReact
					</label>
					<Textarea
						id={sourceId}
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						onBlur={() => commitDraft()}
						onCopy={isolateNodeViewClipboard}
						onCut={isolateNodeViewClipboard}
						onPaste={isolateNodeViewClipboard}
						rows={12}
						className="font-mono text-xs"
						data-testid="theory-live-react-source"
						spellCheck={false}
					/>
				</div>
			) : null}

			{showPreview ? (
				<LiveReactPreviewPane code={editable ? draft : code} />
			) : null}
		</div>
	);
}

/** TipTap node view: Edit/Preview for admins; preview-only when read-only. */
export function LiveReactNodeView({
	node,
	updateAttributes,
	editor,
}: ReactNodeViewProps) {
	const code = String(node.attrs.code ?? "");
	const editable = editor.isEditable;

	return (
		<NodeViewWrapper
			as="div"
			className="my-3"
			data-testid="theory-live-react-node"
		>
			<LiveReactBlock
				code={code}
				onCodeChange={
					editable
						? (next) => {
								updateAttributes({ code: next });
							}
						: undefined
				}
			/>
		</NodeViewWrapper>
	);
}
