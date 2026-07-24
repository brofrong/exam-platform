export {
	createTheoryExtensions,
	emptyTheoryDoc,
	normalizeTheoryDoc,
	type TheoryDoc,
	toActivityContent,
} from "#/features/lesson-editor/lib/editor-schema";
export { SINE_PLOT_LIVE_REACT_CODE } from "#/features/lesson-editor/lib/live-react-sample";
export {
	type ParsedVideoUrl,
	parseVideoUrl,
	type VideoProvider,
} from "#/features/lesson-editor/lib/parse-video-url";
export {
	createPracticeExtensions,
	emptyPracticeDoc,
	normalizePracticeDoc,
	type PracticeDoc,
	toPracticeActivityContent,
} from "#/features/lesson-editor/lib/practice-schema";
export { sanitizePracticeDoc } from "#/features/lesson-editor/lib/sanitize-practice-doc";
export {
	LiveReactBlock,
	type LiveReactBlockProps,
} from "#/features/lesson-editor/ui/live-react-block";
export {
	PracticeEditor,
	type PracticeEditorProps,
} from "#/features/lesson-editor/ui/practice-editor";
export {
	PracticeRenderer,
	type PracticeRendererProps,
} from "#/features/lesson-editor/ui/practice-renderer";
export {
	TheoryEditor,
	type TheoryEditorProps,
} from "#/features/lesson-editor/ui/theory-editor";
export {
	TheoryRenderer,
	type TheoryRendererProps,
} from "#/features/lesson-editor/ui/theory-renderer";
