#!/usr/bin/env bun
/**
 * Bump package.json version: major | minor | patch (bug fix).
 * Also syncs `src/shared/app-version.ts` so the admin UI picks it up via HMR.
 *
 * Usage:
 *   bun run version:major
 *   bun run version:minor
 *   bun run version:patch
 *   bun run scripts/bump-version.ts patch
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const KINDS = ["major", "minor", "patch"] as const;
type Kind = (typeof KINDS)[number];

function isKind(value: string): value is Kind {
	return (KINDS as readonly string[]).includes(value);
}

function parseSemver(version: string): [number, number, number] {
	const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());
	if (!match) {
		throw new Error(
			`Expected semver X.Y.Z in package.json, got "${version}"`,
		);
	}
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function bump([major, minor, patch]: [number, number, number], kind: Kind) {
	switch (kind) {
		case "major":
			return [major + 1, 0, 0] as const;
		case "minor":
			return [major, minor + 1, 0] as const;
		case "patch":
			return [major, minor, patch + 1] as const;
	}
}

function writeAppVersionModule(version: string) {
	const path = resolve("src/shared/app-version.ts");
	writeFileSync(
		path,
		[
			"/** Synced by `scripts/bump-version.ts` — do not edit by hand. */",
			`export const APP_VERSION = "${version}";`,
			"",
		].join("\n"),
	);
}

const kindArg = process.argv[2]?.toLowerCase();
if (!kindArg || !isKind(kindArg)) {
	console.error(
		"Usage: bun run scripts/bump-version.ts <major|minor|patch>",
	);
	process.exit(1);
}

const packagePath = resolve("package.json");
const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as {
	version?: string;
	[key: string]: unknown;
};

if (typeof pkg.version !== "string") {
	throw new Error('package.json is missing a string "version" field');
}

const previous = pkg.version;
const next = bump(parseSemver(previous), kindArg).join(".");
pkg.version = next;
writeFileSync(packagePath, `${JSON.stringify(pkg, null, "\t")}\n`);
writeAppVersionModule(next);

console.log(`version: ${previous} → ${next} (${kindArg})`);
