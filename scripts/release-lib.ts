import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

export type BumpLevel = "major" | "minor" | "patch";

export type UnreleasedEntry = {
	slug: string;
	bullets: string[];
};

export type ChangelogEntry = {
	version: string;
	changes: string[];
};

const LEVEL_ALIASES: Record<string, BumpLevel> = {
	major: "major",
	minor: "minor",
	patch: "patch",
	bugfix: "patch",
	fix: "patch",
};

export function parseBumpLevel(raw: string | undefined): BumpLevel {
	if (raw === undefined || raw === "") {
		return "patch";
	}

	const level = LEVEL_ALIASES[raw.toLowerCase()];
	if (!level) {
		throw new Error(
			`Unknown bump level "${raw}". Use major, minor, or patch (default).`,
		);
	}
	return level;
}

export function bumpSemver(version: string, level: BumpLevel): string {
	const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
	if (!match) {
		throw new Error(`Invalid semver version: ${version}`);
	}

	const major = Number(match[1]);
	const minor = Number(match[2]);
	const patch = Number(match[3]);

	switch (level) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
	}
}

function parseSemverParts(version: string): [number, number, number] {
	const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
	if (!match) {
		throw new Error(`Invalid semver version: ${version}`);
	}
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Comparator for Array.sort — higher versions first. */
export function compareSemverDesc(a: string, b: string): number {
	const [aMajor, aMinor, aPatch] = parseSemverParts(a);
	const [bMajor, bMinor, bPatch] = parseSemverParts(b);

	if (aMajor !== bMajor) {
		return bMajor - aMajor;
	}
	if (aMinor !== bMinor) {
		return bMinor - aMinor;
	}
	return bPatch - aPatch;
}

export function parseBullets(content: string): string[] {
	const bullets: string[] = [];
	for (const line of content.split(/\r?\n/)) {
		const trimmed = line.trimEnd();
		if (trimmed.startsWith("- ")) {
			bullets.push(trimmed.slice(2).trim());
		} else if (trimmed.startsWith("* ")) {
			bullets.push(trimmed.slice(2).trim());
		}
	}
	return bullets;
}

export function parseUnreleasedFiles(dir: string): UnreleasedEntry[] {
	const names = readdirSync(dir)
		.filter((name) => name.endsWith(".md") && name !== ".gitkeep")
		.sort((a, b) => a.localeCompare(b));

	return names.map((name) => {
		const content = readFileSync(join(dir, name), "utf8");
		return {
			slug: basename(name, ".md"),
			bullets: parseBullets(content),
		};
	});
}

export function formatReleasedMarkdown(bullets: string[]): string {
	if (bullets.length === 0) {
		return "";
	}
	return `${bullets.map((b) => `- ${b}`).join("\n")}\n`;
}

function escapeTsString(value: string): string {
	return JSON.stringify(value);
}

export function buildChangelogTs(entries: ChangelogEntry[]): string {
	const header = `export type ChangelogEntry = {
	version: string;
	changes: string[];
};

/** Generated/updated by \`bun run release\`. Do not edit by hand during tasks. */
`;

	if (entries.length === 0) {
		return `${header}export const CHANGELOG: ChangelogEntry[] = [];
`;
	}

	const body = entries
		.map((entry) => {
			const changes =
				entry.changes.length === 0
					? "[]"
					: `[\n\t\t${entry.changes.map(escapeTsString).join(",\n\t\t")},\n\t]`;
			return `\t{\n\t\tversion: ${escapeTsString(entry.version)},\n\t\tchanges: ${changes},\n\t}`;
		})
		.join(",\n");

	return `${header}export const CHANGELOG: ChangelogEntry[] = [
${body},
];
`;
}

export function collectReleasedEntries(
	releasedDir: string,
): ChangelogEntry[] {
	const versions = readdirSync(releasedDir)
		.filter((name) => name.endsWith(".md"))
		.map((name) => basename(name, ".md"))
		.sort(compareSemverDesc);

	return versions.map((version) => {
		const content = readFileSync(join(releasedDir, `${version}.md`), "utf8");
		return {
			version,
			changes: parseBullets(content),
		};
	});
}
