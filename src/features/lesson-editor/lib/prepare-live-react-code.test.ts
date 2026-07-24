import { describe, expect, test } from "bun:test";
import { prepareLiveReactCode } from "#/features/lesson-editor/lib/prepare-live-react-code";

describe("prepareLiveReactCode", () => {
	test("wraps export default function for react-live noInline", () => {
		const source = `export default function App() {
  return <div>hi</div>;
}`;
		const prepared = prepareLiveReactCode(source);
		expect(prepared).toContain("function App()");
		expect(prepared).not.toContain("export default");
		expect(prepared).toContain("render(<App />);");
	});

	test("leaves code that already calls render()", () => {
		const source = `function App() { return null; }\nrender(<App />);`;
		expect(prepareLiveReactCode(source)).toBe(source);
	});

	test("wraps bare named function", () => {
		const source = `function Plot() { return null; }`;
		expect(prepareLiveReactCode(source)).toContain("render(<Plot />);");
	});
});
