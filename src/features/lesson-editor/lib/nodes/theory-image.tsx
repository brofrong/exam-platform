import Image from "@tiptap/extension-image";
import {
	NodeViewWrapper,
	type ReactNodeViewProps,
	ReactNodeViewRenderer,
} from "@tiptap/react";
import { SearchIcon } from "lucide-react";
import { requestImageLightbox } from "#/features/lesson-editor/lib/image-lightbox-bridge";
import { cn } from "@/lib/utils";

function TheoryImagePreviewView({ node }: ReactNodeViewProps) {
	const src = String(node.attrs.src ?? "");
	const alt = String(node.attrs.alt ?? "");
	const width = node.attrs.width as number | string | null | undefined;
	const height = node.attrs.height as number | string | null | undefined;

	if (!src) {
		return (
			<NodeViewWrapper
				as="span"
				className="inline text-sm text-muted-foreground"
			>
				[изображение]
			</NodeViewWrapper>
		);
	}

	function openLightbox() {
		requestImageLightbox({ src, alt: alt || undefined });
	}

	return (
		<NodeViewWrapper
			as="span"
			className="theory-image-preview group relative inline-flex max-w-full align-middle"
			data-testid="theory-image-preview"
		>
			<img
				src={src}
				alt={alt}
				width={typeof width === "number" ? width : undefined}
				height={typeof height === "number" ? height : undefined}
				draggable={false}
				className="theory-image max-h-[min(70vh,28rem)] max-w-full rounded-lg object-contain align-middle"
				style={{
					width: typeof width === "number" ? width : undefined,
					height: typeof height === "number" ? height : "auto",
				}}
			/>
			{/* Mobile / coarse pointer: tap anywhere on the image */}
			<button
				type="button"
				aria-label="Открыть изображение"
				data-testid="theory-image-tap-target"
				className={cn(
					"absolute inset-0 z-[1] rounded-lg",
					"[@media(hover:hover)_and_(pointer:fine)]:hidden",
				)}
				onClick={openLightbox}
			/>
			{/* Desktop: loupe in the top-right on hover */}
			<button
				type="button"
				aria-label="Открыть изображение"
				data-testid="theory-image-loupe"
				className={cn(
					"absolute top-1.5 right-1.5 z-10 inline-flex size-8 items-center justify-center rounded-full",
					"border border-white/40 bg-black/55 text-white shadow-md backdrop-blur-sm",
					"opacity-0 transition-opacity group-hover:opacity-100",
					"[@media(hover:none)]:hidden [@media(pointer:coarse)]:hidden",
					"focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				)}
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					openLightbox();
				}}
			>
				<SearchIcon className="size-4" />
			</button>
		</NodeViewWrapper>
	);
}

declare module "@tiptap/extension-image" {
	interface ImageOptions {
		/** Read-only preview: loupe / tap → fullscreen lightbox. */
		interactivePreview?: boolean;
	}
}

/**
 * TipTap Image with optional React preview node (lightbox) when
 * `interactivePreview` is enabled. Otherwise keeps built-in resize node view.
 */
export const TheoryImage = Image.extend({
	addOptions() {
		const parent = this.parent?.() ?? {
			inline: false,
			allowBase64: false,
			HTMLAttributes: {},
			resize: false as const,
		};
		return {
			...parent,
			interactivePreview: false,
		};
	},

	addNodeView() {
		if (this.options.interactivePreview) {
			return ReactNodeViewRenderer(TheoryImagePreviewView, {
				className: "theory-image-node",
				stopEvent: () => true,
			});
		}
		return this.parent?.() ?? null;
	},
});
