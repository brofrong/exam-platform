#!/usr/bin/env bun
/** Point this clone at `.githooks` (run via `bun run prepare` / install). */
import { spawnSync } from "node:child_process";

const result = spawnSync("git", ["config", "core.hooksPath", ".githooks"], {
	stdio: "inherit",
});

if (result.status !== 0) {
	console.warn(
		"setup-git-hooks: could not set core.hooksPath (ok in non-git CI)",
	);
	process.exit(0);
}

console.log("setup-git-hooks: core.hooksPath = .githooks");
