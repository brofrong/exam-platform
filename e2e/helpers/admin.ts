import { execFileSync } from "node:child_process";

const E2E_POSTGRES_CONTAINER = "zero-postgres-e2e";

/** Promote a user to admin via SQL against the e2e Postgres container. */
export function promoteToAdmin(email: string) {
	const escaped = email.replaceAll("'", "''");
	execFileSync(
		"docker",
		[
			"exec",
			E2E_POSTGRES_CONTAINER,
			"psql",
			"-U",
			"postgres",
			"-d",
			"zero",
			"-v",
			"ON_ERROR_STOP=1",
			"-c",
			`UPDATE "user" SET role = 'admin' WHERE email = '${escaped}';`,
		],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
	);
}
