import type { JSONContent } from "@tiptap/core";
import {
	mafsCodeFor,
	type PlotKind,
} from "#/features/admin-seed/lib/mafs-plots";

function text(value: string, marks?: JSONContent["marks"]): JSONContent {
	return marks?.length
		? { type: "text", text: value, marks }
		: { type: "text", text: value };
}

function paragraph(...parts: JSONContent[]): JSONContent {
	return { type: "paragraph", content: parts };
}

function heading(level: 2 | 3, value: string): JSONContent {
	return {
		type: "heading",
		attrs: { level },
		content: [text(value)],
	};
}

function bullet(...items: string[]): JSONContent {
	return {
		type: "bulletList",
		content: items.map((item) => ({
			type: "listItem",
			content: [paragraph(text(item))],
		})),
	};
}

function liveReact(kind: PlotKind): JSONContent {
	return {
		type: "liveReact",
		attrs: { code: mafsCodeFor(kind) },
	};
}

export type TheoryBrief = {
	lessonTitle: string;
	topicTitle: string;
	subject: string;
	examType: string;
	focus: string;
	plot: PlotKind;
	keyPoints: string[];
	example: string;
};

/** Full theory TipTap doc with Mafs interactive plot. */
export function buildTheoryDoc(brief: TheoryBrief): JSONContent {
	return {
		type: "doc",
		content: [
			heading(2, brief.lessonTitle),
			paragraph(
				text(
					`Тема «${brief.topicTitle}» · ${brief.examType} · ${brief.subject}`,
				),
			),
			paragraph(text(brief.focus)),
			heading(3, "Интерактивный график"),
			paragraph(
				text(
					"Исследуйте зависимость на графике: можно масштабировать (zoom) и сравнить форму кривой с формулами из теории.",
				),
			),
			liveReact(brief.plot),
			heading(3, "Ключевые идеи"),
			bullet(...brief.keyPoints),
			heading(3, "Разбор примера"),
			paragraph(text(brief.example)),
			heading(3, "Что запомнить"),
			paragraph(
				text(
					"Перед практикой убедитесь, что понимаете обозначения, единицы измерения и типовые ловушки формулировок КИМ. Перечитайте определение и ещё раз посмотрите на график.",
				),
			),
		],
	};
}

/** Plain-paragraph TipTap doc used as a `test.prompt`. */
export function buildTestPrompt(promptText: string): JSONContent {
	return { type: "doc", content: [paragraph(text(promptText))] };
}
