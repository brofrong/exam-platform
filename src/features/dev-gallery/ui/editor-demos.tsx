"use client";

import { useState } from "react";
import {
	emptyTheoryDoc,
	type TheoryDoc,
	TheoryEditor,
	TheoryRenderer,
} from "#/features/lesson-editor";

const SAMPLE_DOC: TheoryDoc = {
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "Теория: производная" }],
		},
		{
			type: "paragraph",
			content: [
				{ type: "text", text: "Производная функции " },
				{ type: "text", marks: [{ type: "italic" }], text: "f" },
				{ type: "text", text: " в точке " },
				{ type: "text", marks: [{ type: "bold" }], text: "x₀" },
				{
					type: "text",
					text: " — предел отношения приращения функции к приращению аргумента.",
				},
			],
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
								{ type: "text", text: "Геометрический смысл — касательная" },
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
	],
};

export function TheoryEditorDemo() {
	const [doc, setDoc] = useState<TheoryDoc>(SAMPLE_DOC);

	return (
		<div className="flex w-full max-w-2xl flex-col gap-8">
			<section className="space-y-2">
				<h3 className="text-sm font-medium text-foreground">TheoryEditor</h3>
				<p className="text-sm text-muted-foreground">
					StarterKit + video: заголовки, списки, жирный/курсив, вставка VK /
					YouTube. Контент — TipTap JSON.
				</p>
				<TheoryEditor content={doc} onChange={setDoc} />
			</section>
			<section className="space-y-2">
				<h3 className="text-sm font-medium text-foreground">TheoryRenderer</h3>
				<p className="text-sm text-muted-foreground">
					Read-only рендер того же JSON (для student player).
				</p>
				<div className="rounded-xl border border-border px-3 py-2">
					<TheoryRenderer content={doc} />
				</div>
			</section>
			<section className="space-y-2">
				<h3 className="text-sm font-medium text-foreground">Empty doc</h3>
				<TheoryEditor content={emptyTheoryDoc} />
			</section>
		</div>
	);
}
