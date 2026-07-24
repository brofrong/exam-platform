/**
 * Adapt authoring-format liveReact source for react-live (`noInline` + `render()`).
 * Supports `export default function Name`, bare `function Name`, or code that already calls `render(...)`.
 */
export function prepareLiveReactCode(source: string): string {
	const trimmed = source.trim();
	if (!trimmed) {
		return "render(null);";
	}

	if (/\brender\s*\(/.test(trimmed)) {
		return trimmed;
	}

	const namedFn = trimmed.match(/^export\s+default\s+function\s+(\w+)\s*\(/);
	if (namedFn) {
		const name = namedFn[1];
		const body = trimmed.replace(/^export\s+default\s+/, "");
		return `${body}\n\nrender(<${name} />);`;
	}

	const namedClass = trimmed.match(/^export\s+default\s+class\s+(\w+)/);
	if (namedClass) {
		const name = namedClass[1];
		const body = trimmed.replace(/^export\s+default\s+/, "");
		return `${body}\n\nrender(<${name} />);`;
	}

	if (/^export\s+default\s+/.test(trimmed)) {
		const expr = trimmed
			.replace(/^export\s+default\s+/, "")
			.replace(/;\s*$/, "");
		return `const __LiveApp = ${expr};\n\nrender(<__LiveApp />);`;
	}

	const bareFn = trimmed.match(/^function\s+(\w+)\s*\(/);
	if (bareFn) {
		return `${trimmed}\n\nrender(<${bareFn[1]} />);`;
	}

	return trimmed;
}
