import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BumpLevel = "major" | "minor" | "patch";

const LEVEL_ALIASES: Record<string, BumpLevel> = {
	major: "major",
	minor: "minor",
	patch: "patch",
	bugfix: "patch",
	fix: "patch",
};

function parseLevel(raw: string | undefined): BumpLevel {
	if (raw === undefined || raw === "") {
		return "patch";
	}

	const level = LEVEL_ALIASES[raw.toLowerCase()];
	if (!level) {
		console.error(
			`Unknown bump level "${raw}". Use major, minor, or patch (default).`,
		);
		process.exit(1);
	}
	return level;
}

function bumpVersion(
	major: number,
	minor: number,
	patch: number,
	level: BumpLevel,
): string {
	switch (level) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
	}
}

const level = parseLevel(process.argv[2]);
const packagePath = join(import.meta.dir, "..", "package.json");
const raw = readFileSync(packagePath, "utf8");
const match = /"version"\s*:\s*"(\d+)\.(\d+)\.(\d+)(?:[-+][^"]*)?"/.exec(raw);

if (!match) {
	console.error('package.json is missing a semver "version" field');
	process.exit(1);
}

const major = Number(match[1]);
const minor = Number(match[2]);
const patch = Number(match[3]);
const previousVersion = `${major}.${minor}.${patch}`;
const nextVersion = bumpVersion(major, minor, patch, level);
const next = raw.replace(match[0], `"version": "${nextVersion}"`);

writeFileSync(packagePath, next);
console.log(`Bumped ${level}: ${previousVersion} → ${nextVersion}`);
