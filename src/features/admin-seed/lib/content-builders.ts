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

type ChoiceOption = { id: string; label: string };

function shortText(
	questionId: string,
	prompt: string,
	correctAnswer: string,
): JSONContent {
	return {
		type: "shortTextQuestion",
		attrs: {
			questionId,
			prompt,
			grading: "auto",
			correctAnswer,
		},
	};
}

function singleChoice(
	questionId: string,
	prompt: string,
	options: ChoiceOption[],
	correctOptionId: string,
): JSONContent {
	return {
		type: "singleChoiceQuestion",
		attrs: {
			questionId,
			prompt,
			options,
			grading: "auto",
			correctAnswer: correctOptionId,
		},
	};
}

function multipleChoice(
	questionId: string,
	prompt: string,
	options: ChoiceOption[],
	correctOptionIds: string[],
): JSONContent {
	return {
		type: "multipleChoiceQuestion",
		attrs: {
			questionId,
			prompt,
			options,
			grading: "auto",
			correctAnswer: correctOptionIds,
		},
	};
}

export type PracticeBrief = {
	lessonId: string;
	lessonTitle: string;
	questions: Array<
		| {
				kind: "short";
				prompt: string;
				answer: string;
		  }
		| {
				kind: "single";
				prompt: string;
				options: string[];
				correctIndex: number;
		  }
		| {
				kind: "multi";
				prompt: string;
				options: string[];
				correctIndexes: number[];
		  }
	>;
};

/** Full practice TipTap doc with auto-graded questions. */
export function buildPracticeDoc(brief: PracticeBrief): JSONContent {
	const nodes: JSONContent[] = [
		heading(2, `Практика: ${brief.lessonTitle}`),
		paragraph(
			text(
				"Решите задания. Часть вопросов с автопроверкой — вводите ответ в том виде, который указан в условии (без лишних пробелов).",
			),
		),
	];

	brief.questions.forEach((q, index) => {
		const qid = `${brief.lessonId}-q${index + 1}`;
		nodes.push(heading(3, `Задание ${index + 1}`));
		if (q.kind === "short") {
			nodes.push(shortText(qid, q.prompt, q.answer));
			return;
		}
		const options = q.options.map((label, i) => ({
			id: `${qid}-opt${i + 1}`,
			label,
		}));
		if (q.kind === "single") {
			const correctId =
				options[q.correctIndex]?.id ?? options[0]?.id ?? `${qid}-opt1`;
			nodes.push(singleChoice(qid, q.prompt, options, correctId));
			return;
		}
		nodes.push(
			multipleChoice(
				qid,
				q.prompt,
				options,
				q.correctIndexes
					.map((i) => options[i]?.id)
					.filter((id): id is string => typeof id === "string"),
			),
		);
	});

	return { type: "doc", content: nodes };
}
