import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bumpSemver, parseBumpLevel } from "./release-lib";

const level = (() => {
	try {
		return parseBumpLevel(process.argv[2]);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(message);
		process.exit(1);
	}
})();

const packagePath = join(import.meta.dir, "..", "package.json");
const raw = readFileSync(packagePath, "utf8");
const match = /"version"\s*:\s*"(\d+)\.(\d+)\.(\d+)(?:[-+][^"]*)?"/.exec(raw);

if (!match) {
	console.error('package.json is missing a semver "version" field');
	process.exit(1);
}

const previousVersion = `${match[1]}.${match[2]}.${match[3]}`;
const nextVersion = bumpSemver(previousVersion, level);
const next = raw.replace(match[0], `"version": "${nextVersion}"`);

writeFileSync(packagePath, next);
console.log(`Bumped ${level}: ${previousVersion} → ${nextVersion}`);
