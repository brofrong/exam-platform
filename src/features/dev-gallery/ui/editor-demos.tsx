"use client";

import { useState } from "react";
import {
	SINE_PLOT_LIVE_REACT_CODE,
	type TheoryDoc,
	TheoryEditor,
	TheoryRenderer,
} from "#/features/lesson-editor";

const SAMPLE_DOC: TheoryDoc = {
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: { level: 1 },
			content: [{ type: "text", text: "Производная: краткий конспект" }],
		},
		{
			type: "paragraph",
			content: [
				{ type: "text", text: "Определение. Производная функции " },
				{ type: "text", marks: [{ type: "italic" }], text: "f" },
				{ type: "text", text: " в точке " },
				{ type: "text", marks: [{ type: "bold" }], text: "x₀" },
				{
					type: "text",
					text: " — предел отношения приращения функции к приращению аргумента: $f'(x_0)=\\lim_{h\\to 0}\\dfrac{f(x_0+h)-f(x_0)}{h}$.",
				},
			],
		},
		{
			type: "paragraph",
			content: [
				{ type: "text", text: "Важно: " },
				{
					type: "text",
					marks: [
						{
							type: "highlight",
							attrs: { color: "var(--theory-hl-amber)" },
						},
					],
					text: "существование предела",
				},
				{
					type: "text",
					text: " — необходимое условие дифференцируемости. См. также ",
				},
				{
					type: "text",
					marks: [
						{
							type: "link",
							attrs: {
								href: "https://ru.wikipedia.org/wiki/Производная_функции",
								target: "_blank",
								rel: "noopener noreferrer",
							},
						},
					],
					text: "статью на Википедии",
				},
				{ type: "text", text: "." },
			],
		},
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "Геометрия и физика" }],
		},
		{
			type: "bulletList",
			content: [
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Геометрический смысл — угловой коэффициент касательной",
								},
							],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Физический смысл — мгновенная скорость",
								},
							],
						},
					],
				},
			],
		},
		{
			type: "paragraph",
			attrs: { textAlign: "center" },
			content: [
				{
					type: "text",
					marks: [{ type: "underline" }],
					text: "Запомните: f'(x) ≈ Δy / Δx при малых Δx",
				},
			],
		},
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "Таблица производных" }],
		},
		{
			type: "table",
			content: [
				{
					type: "tableRow",
					content: [
						{
							type: "tableHeader",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "Функция" }],
								},
							],
						},
						{
							type: "tableHeader",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "Производная" }],
								},
							],
						},
						{
							type: "tableHeader",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "Заметка" }],
								},
							],
						},
					],
				},
				{
					type: "tableRow",
					content: [
						{
							type: "tableCell",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "$x^n$" }],
								},
							],
						},
						{
							type: "tableCell",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "$nx^{n-1}$" }],
								},
							],
						},
						{
							type: "tableCell",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "степенная" }],
								},
							],
						},
					],
				},
				{
					type: "tableRow",
					content: [
						{
							type: "tableCell",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "$\\sin x$" }],
								},
							],
						},
						{
							type: "tableCell",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "$\\cos x$" }],
								},
							],
						},
						{
							type: "tableCell",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "в радианах" }],
								},
							],
						},
					],
				},
				{
					type: "tableRow",
					content: [
						{
							type: "tableCell",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "$e^x$" }],
								},
							],
						},
						{
							type: "tableCell",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "$e^x$" }],
								},
							],
						},
						{
							type: "tableCell",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "совпадает" }],
								},
							],
						},
					],
				},
			],
		},
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "Пример на Python" }],
		},
		{
			type: "paragraph",
			content: [
				{
					type: "text",
					text: 'Численная оценка производной (Typography превращает -- в тире и "кавычки" в «ёлочки» при наборе):',
				},
			],
		},
		{
			type: "codeBlock",
			attrs: { language: "python" },
			content: [
				{
					type: "text",
					text: "def derivative(f, x, h=1e-6):\n    return (f(x + h) - f(x)) / h\n\nprint(derivative(lambda t: t**2, 3))  # ≈ 6",
				},
			],
		},
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "Блок-формула" }],
		},
		{
			type: "paragraph",
			content: [
				{
					type: "text",
					text: "$$(uv)' = u'v + uv'$$",
				},
			],
		},
		{
			type: "paragraph",
			content: [{ type: "text", text: "Видео-разбор (VK):" }],
		},
		{
			type: "video",
			attrs: {
				provider: "vk",
				sourceId: "-123456_789012",
				embedUrl: "https://vk.com/video_ext.php?oid=-123456&id=789012",
				originalUrl: "https://vk.com/video-123456_789012",
			},
		},
		{
			type: "paragraph",
			content: [{ type: "text", text: "Интерактив: график sin(x) (Mafs):" }],
		},
		{
			type: "liveReact",
			attrs: {
				code: SINE_PLOT_LIVE_REACT_CODE,
			},
		},
		{
			type: "heading",
			attrs: { level: 3 },
			content: [{ type: "text", text: "Чеклист перед экзаменом" }],
		},
		{
			type: "orderedList",
			content: [
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Таблица производных элементарных функций",
								},
							],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Правила: сумма, произведение, частное, цепочка",
								},
							],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Геометрический смысл и уравнение касательной",
								},
							],
						},
					],
				},
			],
		},
	],
};

export function TheoryEditorDemo() {
	const [doc, setDoc] = useState<TheoryDoc>(SAMPLE_DOC);

	return (
		<div
			className="flex h-[min(78vh,820px)] w-full min-h-[32rem] flex-col gap-3"
			data-testid="theory-editor-demo"
		>
			<p className="shrink-0 text-sm text-muted-foreground">
				Слева — редактор (тулбар sticky при скролле), справа — live-превью.
				Панели скроллятся независимо. Попробуйте ссылки, выравнивание,
				highlight, таблицу, code block и формулы $...$ / $$...$$.
			</p>
			<div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
				<section
					className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-background"
					data-testid="theory-editor-demo-editor-pane"
				>
					<div className="shrink-0 border-b border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
						Редактор
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto">
						<TheoryEditor
							content={doc}
							onChange={setDoc}
							className="rounded-none border-0"
						/>
					</div>
				</section>
				<section
					className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-background"
					data-testid="theory-editor-demo-preview-pane"
				>
					<div className="shrink-0 border-b border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
						Превью (TheoryRenderer)
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
						<TheoryRenderer content={doc} />
					</div>
				</section>
			</div>
		</div>
	);
}
