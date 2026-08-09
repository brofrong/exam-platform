import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	buildChangelogTs,
	bumpSemver,
	compareSemverDesc,
	formatReleasedMarkdown,
	parseUnreleasedFiles,
} from "./release-lib";

const tempDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), "release-test-"));
	tempDirs.push(dir);
	return dir;
}

afterEach(() => {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
});

describe("parseUnreleasedFiles", () => {
	test("returns sorted entries with bullets from - and * lines", () => {
		const dir = makeTempDir();
		writeFileSync(join(dir, ".gitkeep"), "");
		writeFileSync(
			join(dir, "fix-login.md"),
			"- Исправлен редирект\n* Ещё один фикс\n\nignored line\n",
		);
		writeFileSync(join(dir, "feat-modal.md"), "- Добавлена модалка\n");

		const entries = parseUnreleasedFiles(dir);

		expect(entries).toEqual([
			{ slug: "feat-modal", bullets: ["Добавлена модалка"] },
			{
				slug: "fix-login",
				bullets: ["Исправлен редирект", "Ещё один фикс"],
			},
		]);
	});

	test("skips .gitkeep and non-md files", () => {
		const dir = makeTempDir();
		writeFileSync(join(dir, ".gitkeep"), "");
		writeFileSync(join(dir, "notes.txt"), "- not a changelog\n");

		expect(parseUnreleasedFiles(dir)).toEqual([]);
	});

	test("includes files with no bullets as empty bullet lists", () => {
		const dir = makeTempDir();
		writeFileSync(join(dir, "empty.md"), "just text\n");

		expect(parseUnreleasedFiles(dir)).toEqual([
			{ slug: "empty", bullets: [] },
		]);
	});
});

describe("formatReleasedMarkdown", () => {
	test("formats bullets as markdown list lines", () => {
		expect(formatReleasedMarkdown(["Первый", "Второй"])).toBe(
			"- Первый\n- Второй\n",
		);
	});

	test("returns empty string for no bullets", () => {
		expect(formatReleasedMarkdown([])).toBe("");
	});
});

describe("buildChangelogTs", () => {
	test("builds TypeScript source with newest-first entries", () => {
		const source = buildChangelogTs([
			{ version: "0.1.3", changes: ["Пункт А", "Пункт Б"] },
			{ version: "0.1.2", changes: ["Старый пункт"] },
		]);

		expect(source).toContain('export type ChangelogEntry = {');
		expect(source).toContain("version: string;");
		expect(source).toContain("changes: string[];");
		expect(source).toContain(
			"/** Generated/updated by `bun run release`. Do not edit by hand during tasks. */",
		);
		expect(source).toContain("export const CHANGELOG: ChangelogEntry[] = [");
		expect(source).toContain('version: "0.1.3"');
		expect(source).toContain('version: "0.1.2"');
		expect(source).toContain('"Пункт А"');
		expect(source).toContain('"Пункт Б"');
		expect(source).toContain('"Старый пункт"');
		expect(source.indexOf("0.1.3")).toBeLessThan(source.indexOf("0.1.2"));
	});

	test("builds empty CHANGELOG array", () => {
		const source = buildChangelogTs([]);
		expect(source).toContain("export const CHANGELOG: ChangelogEntry[] = [];");
	});
});

describe("bumpSemver", () => {
	test("bumps patch, minor, and major", () => {
		expect(bumpSemver("0.1.2", "patch")).toBe("0.1.3");
		expect(bumpSemver("0.1.2", "minor")).toBe("0.2.0");
		expect(bumpSemver("0.1.2", "major")).toBe("1.0.0");
	});
});

describe("compareSemverDesc", () => {
	test("orders higher versions before lower ones", () => {
		expect(compareSemverDesc("0.1.3", "0.1.2")).toBeLessThan(0);
		expect(compareSemverDesc("0.1.2", "0.1.3")).toBeGreaterThan(0);
		expect(compareSemverDesc("1.0.0", "0.9.9")).toBeLessThan(0);
		expect(compareSemverDesc("0.2.0", "0.2.0")).toBe(0);
	});

	test("sorts released filenames newest first", () => {
		const versions = ["0.1.2", "0.2.0", "0.1.10", "1.0.0"];
		expect([...versions].sort(compareSemverDesc)).toEqual([
			"1.0.0",
			"0.2.0",
			"0.1.10",
			"0.1.2",
		]);
	});
});

describe("temp dir helpers used by release flow", () => {
	test("can stage unreleased and released dirs like the real tree", () => {
		const root = makeTempDir();
		const unreleased = join(root, "unreleased");
		const released = join(root, "released");
		mkdirSync(unreleased);
		mkdirSync(released);
		writeFileSync(join(unreleased, ".gitkeep"), "");
		writeFileSync(join(released, ".gitkeep"), "");
		writeFileSync(join(unreleased, "feat-a.md"), "- Новый пункт\n");

		const entries = parseUnreleasedFiles(unreleased);
		const bullets = entries.flatMap((e) => e.bullets);
		const md = formatReleasedMarkdown(bullets);
		const next = bumpSemver("0.1.2", "patch");

		expect(entries).toHaveLength(1);
		expect(md).toBe("- Новый пункт\n");
		expect(next).toBe("0.1.3");
	});
});
