import { describe, expect, test } from "bun:test";
import { parseEditorPayload } from "#/features/ai-author-chat/lib/apply-to-editor";

describe("parseEditorPayload", () => {
	test("parses full TipTap doc", () => {
		const payload = parseEditorPayload(
			"json",
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: "Hi" }],
					},
				],
			}),
		);
		expect(payload?.kind).toBe("doc");
	});

	test("parses single node as fragment", () => {
		const payload = parseEditorPayload(
			"json",
			JSON.stringify({
				type: "heading",
				attrs: { level: 2 },
				content: [{ type: "text", text: "Title" }],
			}),
		);
		expect(payload).toEqual({
			kind: "fragment",
			content: [
				{
					type: "heading",
					attrs: { level: 2 },
					content: [{ type: "text", text: "Title" }],
				},
			],
		});
	});

	test("parses Mafs jsx as liveReact", () => {
		const code = `export default function App() {
  return (
    <div>
      <Mafs><Coordinates.Cartesian /></Mafs>
    </div>
  );
}`;
		const payload = parseEditorPayload("jsx", code);
		expect(payload).toEqual({ kind: "liveReact", code });
	});

	test("rejects invalid json", () => {
		expect(parseEditorPayload("json", "{nope")).toBeNull();
	});

	test("TipTap doc with embedded Mafs stays a doc, not liveReact", () => {
		const doc = {
			type: "doc",
			content: [
				{
					type: "heading",
					attrs: { level: 2 },
					content: [{ type: "text", text: "График" }],
				},
				{
					type: "paragraph",
					content: [{ type: "text", text: "Смотри $y=\\sin x$." }],
				},
				{
					type: "liveReact",
					attrs: {
						code: `export default function App() {
  return (
    <div style={{ width: "100%", height: "420px" }}>
      <Mafs viewBox={{ x: [-5, 5], y: [-3, 3] }} zoom>
        <Coordinates.Cartesian />
        <Plot.OfX y={(x) => Math.sin(x)} color={Theme.blue} />
      </Mafs>
    </div>
  );
}`,
					},
				},
			],
		};
		const payload = parseEditorPayload("json", JSON.stringify(doc));
		expect(payload?.kind).toBe("doc");
		if (payload?.kind === "doc") {
			expect(payload.doc.content?.map((n) => n.type)).toEqual([
				"heading",
				"paragraph",
				"liveReact",
			]);
		}
	});
});
