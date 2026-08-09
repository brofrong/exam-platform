import {
	existsSync,
	readdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
	buildChangelogTs,
	bumpSemver,
	collectReleasedEntries,
	formatReleasedMarkdown,
	parseBumpLevel,
	parseUnreleasedFiles,
	type BumpLevel,
} from "./release-lib";

export {
	buildChangelogTs,
	bumpSemver,
	collectReleasedEntries,
	compareSemverDesc,
	formatReleasedMarkdown,
	parseBumpLevel,
	parseUnreleasedFiles,
	type BumpLevel,
	type ChangelogEntry,
	type UnreleasedEntry,
} from "./release-lib";

type ReleaseOptions = {
	level: BumpLevel;
	dryRun: boolean;
	allowEmpty: boolean;
	rootDir?: string;
};

function parseArgs(argv: string[]): ReleaseOptions {
	let level: BumpLevel = "patch";
	let dryRun = false;
	let allowEmpty = false;

	for (const arg of argv) {
		if (arg === "--dry-run") {
			dryRun = true;
			continue;
		}
		if (arg === "--allow-empty") {
			allowEmpty = true;
			continue;
		}
		if (arg.startsWith("-")) {
			throw new Error(`Unknown flag: ${arg}`);
		}
		level = parseBumpLevel(arg);
	}

	return { level, dryRun, allowEmpty };
}

function readPackageVersion(packagePath: string): string {
	const raw = readFileSync(packagePath, "utf8");
	const match = /"version"\s*:\s*"(\d+\.\d+\.\d+(?:[-+][^"]*)?)"/.exec(raw);
	if (!match) {
		throw new Error('package.json is missing a semver "version" field');
	}
	return match[1];
}

function writePackageVersion(packagePath: string, nextVersion: string): void {
	const raw = readFileSync(packagePath, "utf8");
	const match = /"version"\s*:\s*"(\d+)\.(\d+)\.(\d+)(?:[-+][^"]*)?"/.exec(raw);
	if (!match) {
		throw new Error('package.json is missing a semver "version" field');
	}
	writeFileSync(packagePath, raw.replace(match[0], `"version": "${nextVersion}"`));
}

function deleteUnreleasedMarkdown(unreleasedDir: string): string[] {
	const deleted: string[] = [];
	for (const name of readdirSync(unreleasedDir)) {
		if (!name.endsWith(".md")) {
			continue;
		}
		unlinkSync(join(unreleasedDir, name));
		deleted.push(name);
	}
	return deleted;
}

export async function runRelease(options: ReleaseOptions): Promise<void> {
	const rootDir = options.rootDir ?? join(import.meta.dir, "..");
	const packagePath = join(rootDir, "package.json");
	const unreleasedDir = join(rootDir, "changes", "unreleased");
	const releasedDir = join(rootDir, "changes", "released");
	const changelogPath = join(rootDir, "src", "shared", "changelog.ts");

	if (!existsSync(unreleasedDir) || !existsSync(releasedDir)) {
		throw new Error("Expected changes/unreleased and changes/released directories");
	}

	const previousVersion = readPackageVersion(packagePath);
	const nextVersion = bumpSemver(previousVersion, options.level);
	const entries = parseUnreleasedFiles(unreleasedDir);
	const bullets = entries.flatMap((entry) => entry.bullets);

	if (bullets.length === 0 && !options.allowEmpty) {
		throw new Error(
			"No unreleased changelog bullets found. Add files under changes/unreleased/ or pass --allow-empty.",
		);
	}

	const releasedMarkdown = formatReleasedMarkdown(bullets);
	const releasedPath = join(releasedDir, `${nextVersion}.md`);

	console.log(`Release plan:`);
	console.log(`  bump: ${previousVersion} → ${nextVersion} (${options.level})`);
	console.log(`  unreleased files: ${entries.length}`);
	console.log(`  bullets: ${bullets.length}`);
	console.log(`  write: changes/released/${nextVersion}.md`);
	console.log(`  clear: changes/unreleased/*.md`);
	console.log(`  rebuild: src/shared/changelog.ts`);
	console.log(`  update: package.json`);

	if (options.dryRun) {
		console.log("Dry run — no files written.");
		return;
	}

	writeFileSync(releasedPath, releasedMarkdown);

	const deleted = deleteUnreleasedMarkdown(unreleasedDir);
	const allReleased = collectReleasedEntries(releasedDir);
	writeFileSync(changelogPath, buildChangelogTs(allReleased));
	writePackageVersion(packagePath, nextVersion);

	console.log(`Released ${nextVersion}`);
	console.log(`  wrote ${releasedPath}`);
	console.log(`  deleted ${deleted.length} unreleased file(s)`);
	console.log(`  updated ${changelogPath}`);
	console.log(`  package.json → ${nextVersion}`);
}

async function main(): Promise<void> {
	try {
		const options = parseArgs(process.argv.slice(2));
		await runRelease(options);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(message);
		process.exit(1);
	}
}

if (import.meta.main) {
	await main();
}
