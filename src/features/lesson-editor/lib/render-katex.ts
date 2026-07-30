import renderMathInElement from "katex/contrib/auto-render";

const KATEX_OPTIONS: renderMathInElement.RenderMathInElementOptions = {
	delimiters: [
		{ left: "$$", right: "$$", display: true },
		{ left: "$", right: "$", display: false },
		{ left: "\\(", right: "\\)", display: false },
		{ left: "\\[", right: "\\]", display: true },
	],
	throwOnError: false,
	ignoredTags: [
		"script",
		"noscript",
		"style",
		"textarea",
		"pre",
		"code",
		"kbd",
		"samp",
	],
};

/** Render `$...$` / `$$...$$` (and \\( \\) / \\[ \\]) inside an element via KaTeX. */
export function renderKatexInElement(element: HTMLElement): void {
	renderMathInElement(element, KATEX_OPTIONS);
}
