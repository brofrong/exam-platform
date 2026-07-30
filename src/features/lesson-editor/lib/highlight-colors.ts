/** Semantic highlight tokens stored in TipTap JSON as `var(--theory-hl-*)`. */
export const THEORY_HIGHLIGHT_COLORS = [
	{ id: "amber", label: "Янтарный", cssVar: "var(--theory-hl-amber)" },
	{ id: "lime", label: "Лайм", cssVar: "var(--theory-hl-lime)" },
	{ id: "mint", label: "Мятный", cssVar: "var(--theory-hl-mint)" },
	{ id: "cyan", label: "Бирюзовый", cssVar: "var(--theory-hl-cyan)" },
	{ id: "sky", label: "Небесный", cssVar: "var(--theory-hl-sky)" },
	{ id: "violet", label: "Фиолетовый", cssVar: "var(--theory-hl-violet)" },
	{ id: "fuchsia", label: "Фуксия", cssVar: "var(--theory-hl-fuchsia)" },
	{ id: "rose", label: "Розовый", cssVar: "var(--theory-hl-rose)" },
	{ id: "orange", label: "Оранжевый", cssVar: "var(--theory-hl-orange)" },
	{ id: "red", label: "Красный", cssVar: "var(--theory-hl-red)" },
] as const;

export type TheoryHighlightColorId =
	(typeof THEORY_HIGHLIGHT_COLORS)[number]["id"];

export const DEFAULT_THEORY_HIGHLIGHT_COLOR = THEORY_HIGHLIGHT_COLORS[0].cssVar;

export function isTheoryHighlightColor(
	value: unknown,
): value is (typeof THEORY_HIGHLIGHT_COLORS)[number]["cssVar"] {
	return (
		typeof value === "string" &&
		THEORY_HIGHLIGHT_COLORS.some((color) => color.cssVar === value)
	);
}
