import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { gripOnlyStopEvent } from "#/features/lesson-editor/lib/grip-only-stop-event";
import { SINE_PLOT_LIVE_REACT_CODE } from "#/features/lesson-editor/lib/live-react-sample";
import { LiveReactNodeView } from "#/features/lesson-editor/ui/live-react-block";

export type LiveReactNodeAttrs = {
	code: string;
};

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		liveReact: {
			insertLiveReact: (attrs?: Partial<LiveReactNodeAttrs>) => ReturnType;
		};
	}
}

export const LiveReact = Node.create({
	name: "liveReact",
	group: "block",
	atom: true,
	draggable: true,
	selectable: true,

	addAttributes() {
		return {
			code: {
				default: SINE_PLOT_LIVE_REACT_CODE,
			},
		} satisfies Record<keyof LiveReactNodeAttrs, { default: string }>;
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="liveReact"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(HTMLAttributes, { "data-type": "liveReact" }),
		];
	},

	addCommands() {
		return {
			insertLiveReact:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: {
							code: attrs?.code ?? SINE_PLOT_LIVE_REACT_CODE,
						},
					}),
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(LiveReactNodeView, {
			stopEvent: gripOnlyStopEvent,
		});
	},
});
