import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import * as React from "react";
import { useEffect, useId, useState } from "react";
import { LiveError, LivePreview, LiveProvider } from "react-live";
import { prepareLiveReactCode } from "#/features/lesson-editor/lib/prepare-live-react-code";
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

export type LiveReactBlockProps = {
	code: string;
	className?: string;
	/** When set, shows an editable source textarea under the preview (admin editor). */
	onCodeChange?: (code: string) => void;
};

export function LiveReactBlock({
	code,
	className,
	onCodeChange,
}: LiveReactBlockProps) {
	const sourceId = useId();
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
			className={cn(
				"overflow-hidden rounded-xl border border-border bg-background",
				className,
			)}
			data-testid="theory-live-react-block"
		>
			<div className="min-h-[12rem] bg-muted/30 p-2">
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
							className="live-react-preview w-full overflow-auto"
							data-testid="theory-live-react-preview"
						/>
						<LiveError
							className="mt-2 block whitespace-pre-wrap rounded-md bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive"
							data-testid="theory-live-react-error"
						/>
					</LiveProvider>
				)}
			</div>
			{onCodeChange ? (
				<div className="border-t border-border p-2">
					<label
						htmlFor={sourceId}
						className="mb-1 block text-xs text-muted-foreground"
					>
						Исходный код (scope: React, Mafs, Coordinates, Plot, Theme, …)
					</label>
					<Textarea
						id={sourceId}
						value={code}
						onChange={(event) => onCodeChange(event.target.value)}
						rows={10}
						className="font-mono text-xs"
						data-testid="theory-live-react-source"
						spellCheck={false}
					/>
				</div>
			) : null}
		</div>
	);
}

/** TipTap node view: shared preview; source editor only when the document is editable. */
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
			data-drag-handle
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
