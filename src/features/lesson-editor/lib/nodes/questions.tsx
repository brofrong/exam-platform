import { mergeAttributes, Node } from "@tiptap/core";
import { type ReactNodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";
import {
	defaultFileUploadAttrs,
	defaultMultipleChoiceAttrs,
	defaultShortTextAttrs,
	defaultSingleChoiceAttrs,
	type FileUploadQuestionAttrs,
	type MultipleChoiceQuestionAttrs,
	parseGrading,
	parseOptions,
	type ShortTextQuestionAttrs,
	type SingleChoiceQuestionAttrs,
} from "#/features/lesson-editor/lib/nodes/question-attrs";
import {
	type QuestionKind,
	QuestionNodeView,
} from "#/features/lesson-editor/lib/nodes/question-node-view";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		shortTextQuestion: {
			insertShortTextQuestion: (
				attrs?: Partial<ShortTextQuestionAttrs>,
			) => ReturnType;
		};
		singleChoiceQuestion: {
			insertSingleChoiceQuestion: (
				attrs?: Partial<SingleChoiceQuestionAttrs>,
			) => ReturnType;
		};
		multipleChoiceQuestion: {
			insertMultipleChoiceQuestion: (
				attrs?: Partial<MultipleChoiceQuestionAttrs>,
			) => ReturnType;
		};
		fileUploadQuestion: {
			insertFileUploadQuestion: (
				attrs?: Partial<FileUploadQuestionAttrs>,
			) => ReturnType;
		};
	}
}

function createQuestionNodeView(kind: QuestionKind) {
	function View(props: ReactNodeViewProps) {
		return <QuestionNodeView {...props} kind={kind} />;
	}
	View.displayName = `QuestionNodeView_${kind}`;
	return View;
}

function parseOptionsAttr(element: HTMLElement) {
	const raw = element.getAttribute("data-options");
	if (!raw) {
		return parseOptions([]);
	}
	try {
		return parseOptions(JSON.parse(raw) as unknown);
	} catch {
		return parseOptions([]);
	}
}

export const ShortTextQuestion = Node.create({
	name: "shortTextQuestion",
	group: "block",
	atom: true,
	draggable: true,
	selectable: true,

	addAttributes() {
		return {
			questionId: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-question-id") ?? "",
				renderHTML: (attributes) => ({
					"data-question-id": attributes.questionId,
				}),
			},
			prompt: { default: "Введите вопрос" },
			grading: {
				default: "auto",
				parseHTML: (element) =>
					parseGrading(element.getAttribute("data-grading"), "auto"),
				renderHTML: (attributes) => ({
					"data-grading": attributes.grading,
				}),
			},
			correctAnswer: { default: "" },
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="shortTextQuestion"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(HTMLAttributes, { "data-type": "shortTextQuestion" }),
		];
	},

	addCommands() {
		return {
			insertShortTextQuestion:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: defaultShortTextAttrs(attrs),
					}),
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(createQuestionNodeView("shortText"));
	},
});

export const SingleChoiceQuestion = Node.create({
	name: "singleChoiceQuestion",
	group: "block",
	atom: true,
	draggable: true,
	selectable: true,

	addAttributes() {
		return {
			questionId: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-question-id") ?? "",
				renderHTML: (attributes) => ({
					"data-question-id": attributes.questionId,
				}),
			},
			prompt: { default: "Выберите один вариант" },
			options: {
				default: [],
				parseHTML: (element) => parseOptionsAttr(element),
				renderHTML: (attributes) => ({
					"data-options": JSON.stringify(attributes.options ?? []),
				}),
			},
			grading: {
				default: "auto",
				parseHTML: (element) =>
					parseGrading(element.getAttribute("data-grading"), "auto"),
				renderHTML: (attributes) => ({
					"data-grading": attributes.grading,
				}),
			},
			correctAnswer: { default: null },
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="singleChoiceQuestion"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(HTMLAttributes, { "data-type": "singleChoiceQuestion" }),
		];
	},

	addCommands() {
		return {
			insertSingleChoiceQuestion:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: defaultSingleChoiceAttrs(attrs),
					}),
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(createQuestionNodeView("singleChoice"));
	},
});

export const MultipleChoiceQuestion = Node.create({
	name: "multipleChoiceQuestion",
	group: "block",
	atom: true,
	draggable: true,
	selectable: true,

	addAttributes() {
		return {
			questionId: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-question-id") ?? "",
				renderHTML: (attributes) => ({
					"data-question-id": attributes.questionId,
				}),
			},
			prompt: { default: "Выберите один или несколько вариантов" },
			options: {
				default: [],
				parseHTML: (element) => parseOptionsAttr(element),
				renderHTML: (attributes) => ({
					"data-options": JSON.stringify(attributes.options ?? []),
				}),
			},
			grading: {
				default: "auto",
				parseHTML: (element) =>
					parseGrading(element.getAttribute("data-grading"), "auto"),
				renderHTML: (attributes) => ({
					"data-grading": attributes.grading,
				}),
			},
			correctAnswer: { default: [] },
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="multipleChoiceQuestion"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(HTMLAttributes, {
				"data-type": "multipleChoiceQuestion",
			}),
		];
	},

	addCommands() {
		return {
			insertMultipleChoiceQuestion:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: defaultMultipleChoiceAttrs(attrs),
					}),
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(createQuestionNodeView("multipleChoice"));
	},
});

export const FileUploadQuestion = Node.create({
	name: "fileUploadQuestion",
	group: "block",
	atom: true,
	draggable: true,
	selectable: true,

	addAttributes() {
		return {
			questionId: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-question-id") ?? "",
				renderHTML: (attributes) => ({
					"data-question-id": attributes.questionId,
				}),
			},
			prompt: { default: "Загрузите файл ответа" },
			grading: {
				default: "manual",
				parseHTML: (element) =>
					parseGrading(element.getAttribute("data-grading"), "manual"),
				renderHTML: (attributes) => ({
					"data-grading": attributes.grading,
				}),
			},
			correctAnswer: { default: null },
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="fileUploadQuestion"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(HTMLAttributes, { "data-type": "fileUploadQuestion" }),
		];
	},

	addCommands() {
		return {
			insertFileUploadQuestion:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: defaultFileUploadAttrs(attrs),
					}),
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(createQuestionNodeView("fileUpload"));
	},
});
