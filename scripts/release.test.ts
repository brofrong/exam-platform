import { afterEach, describe, expect, test } from "bun:test";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	buildChangelogTs,
	bumpSemver,
	compareSemverDesc,
	formatReleasedMarkdown,
	parseUnreleasedFiles,
} from "./release-lib";
import { runRelease } from "./release";

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

const EMPTY_CHANGELOG_TS = `export type ChangelogEntry = {
	version: string;
	changes: string[];
};

/** Generated/updated by \`bun run release\`. Do not edit by hand during tasks. */
export const CHANGELOG: ChangelogEntry[] = [];
`;

function makeReleaseFixture(options?: {
	version?: string;
	unreleased?: Record<string, string>;
	released?: Record<string, string>;
	changelogTs?: string;
}): string {
	const root = makeTempDir();
	const version = options?.version ?? "0.1.2";
	const unreleasedDir = join(root, "changes", "unreleased");
	const releasedDir = join(root, "changes", "released");
	const sharedDir = join(root, "src", "shared");

	mkdirSync(unreleasedDir, { recursive: true });
	mkdirSync(releasedDir, { recursive: true });
	mkdirSync(sharedDir, { recursive: true });

	writeFileSync(
		join(root, "package.json"),
		JSON.stringify({ name: "fixture", version }, null, "\t") + "\n",
	);
	writeFileSync(join(unreleasedDir, ".gitkeep"), "");
	writeFileSync(join(releasedDir, ".gitkeep"), "");
	writeFileSync(
		join(sharedDir, "changelog.ts"),
		options?.changelogTs ?? EMPTY_CHANGELOG_TS,
	);

	for (const [name, content] of Object.entries(options?.unreleased ?? {})) {
		writeFileSync(join(unreleasedDir, name), content);
	}
	for (const [name, content] of Object.entries(options?.released ?? {})) {
		writeFileSync(join(releasedDir, name), content);
	}

	return root;
}

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

	test("escapes quotes in change text", () => {
		const source = buildChangelogTs([
			{ version: "0.1.3", changes: ['He said "hello"'] },
		]);
		expect(source).toContain('"He said \\"hello\\""');
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

describe("runRelease", () => {
	test("dry-run leaves the tree unchanged", async () => {
		const root = makeReleaseFixture({
			unreleased: { "feat-a.md": "- Новый пункт\n" },
		});
		const packageBefore = readFileSync(join(root, "package.json"), "utf8");
		const changelogBefore = readFileSync(
			join(root, "src", "shared", "changelog.ts"),
			"utf8",
		);

		await runRelease({
			level: "patch",
			dryRun: true,
			allowEmpty: false,
			rootDir: root,
		});

		expect(existsSync(join(root, "changes", "released", "0.1.3.md"))).toBe(
			false,
		);
		expect(
			existsSync(join(root, "changes", "unreleased", "feat-a.md")),
		).toBe(true);
		expect(readFileSync(join(root, "package.json"), "utf8")).toBe(
			packageBefore,
		);
		expect(
			readFileSync(join(root, "src", "shared", "changelog.ts"), "utf8"),
		).toBe(changelogBefore);
	});

	test("writes released file, clears unreleased, rebuilds changelog, bumps version", async () => {
		const root = makeReleaseFixture({
			unreleased: { "feat-a.md": "- Новый пункт\n" },
			released: { "0.1.2.md": "- Старый пункт\n" },
		});

		await runRelease({
			level: "patch",
			dryRun: false,
			allowEmpty: false,
			rootDir: root,
		});

		expect(
			readFileSync(join(root, "changes", "released", "0.1.3.md"), "utf8"),
		).toBe("- Новый пункт\n");
		expect(
			existsSync(join(root, "changes", "unreleased", "feat-a.md")),
		).toBe(false);
		expect(
			existsSync(join(root, "changes", "unreleased", ".gitkeep")),
		).toBe(true);
		expect(readdirSync(join(root, "changes", "unreleased"))).toEqual([
			".gitkeep",
		]);

		const changelog = readFileSync(
			join(root, "src", "shared", "changelog.ts"),
			"utf8",
		);
		expect(changelog).toBe(
			buildChangelogTs([
				{ version: "0.1.3", changes: ["Новый пункт"] },
				{ version: "0.1.2", changes: ["Старый пункт"] },
			]),
		);

		const pkg = JSON.parse(
			readFileSync(join(root, "package.json"), "utf8"),
		) as { version: string };
		expect(pkg.version).toBe("0.1.3");
	});

	test("throws when changelog is empty and allowEmpty is false", async () => {
		const root = makeReleaseFixture();

		await expect(
			runRelease({
				level: "patch",
				dryRun: false,
				allowEmpty: false,
				rootDir: root,
			}),
		).rejects.toThrow(/No unreleased changelog bullets found/);
	});
});
