import { mergeAttributes, Node } from "@tiptap/core";
import {
	NodeViewWrapper,
	type ReactNodeViewProps,
	ReactNodeViewRenderer,
} from "@tiptap/react";
import type { ParsedVideoUrl } from "#/features/lesson-editor/lib/parse-video-url";
import { VideoEmbedFrame } from "@/components/lms";

export type VideoNodeAttrs = {
	provider: ParsedVideoUrl["provider"] | null;
	sourceId: string | null;
	embedUrl: string | null;
	originalUrl: string | null;
};

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		video: {
			insertVideo: (attrs: ParsedVideoUrl) => ReturnType;
		};
	}
}

function VideoNodeView({ node }: ReactNodeViewProps) {
	const embedUrl = String(node.attrs.embedUrl ?? "");
	const originalUrl = String(node.attrs.originalUrl ?? "");
	const title =
		node.attrs.provider === "youtube"
			? "YouTube"
			: node.attrs.provider === "vk"
				? "VK Video"
				: "Видео";

	if (!embedUrl) {
		return (
			<NodeViewWrapper
				as="div"
				className="my-3 rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground"
				data-testid="theory-video-node-empty"
			>
				Видео без URL
			</NodeViewWrapper>
		);
	}

	return (
		<NodeViewWrapper
			as="div"
			className="my-3"
			data-drag-handle
			data-testid="theory-video-node"
			data-provider={node.attrs.provider ?? undefined}
			data-original-url={originalUrl || undefined}
		>
			<VideoEmbedFrame embedUrl={embedUrl} title={title} />
		</NodeViewWrapper>
	);
}

export const Video = Node.create({
	name: "video",
	group: "block",
	atom: true,
	draggable: true,
	selectable: true,

	addAttributes() {
		return {
			provider: { default: null },
			sourceId: { default: null },
			embedUrl: { default: null },
			originalUrl: { default: null },
		} satisfies Record<keyof VideoNodeAttrs, { default: null }>;
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="video"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["div", mergeAttributes(HTMLAttributes, { "data-type": "video" })];
	},

	addCommands() {
		return {
			insertVideo:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: {
							provider: attrs.provider,
							sourceId: attrs.sourceId,
							embedUrl: attrs.embedUrl,
							originalUrl: attrs.originalUrl,
						},
					}),
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(VideoNodeView);
	},
});
