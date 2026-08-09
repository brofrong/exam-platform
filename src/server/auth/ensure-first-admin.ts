import { randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import type { auth } from "#/server/auth/auth";
import { account } from "#/server/db/auth/auth.schema";
import { db } from "#/server/db/db";
import { appSettingsTable } from "#/server/db/setting/setting.schema";
import { usersTable } from "#/server/db/user/user.schema";

export const BOOTSTRAP_ADMIN_PASSWORD_KEY = "BOOTSTRAP_ADMIN_PASSWORD";
export const BOOTSTRAP_ADMIN_USERNAME = "admin";
export const BOOTSTRAP_ADMIN_EMAIL = "admin@admin.com";
export const BOOTSTRAP_ADMIN_NAME = "Admin";

function generatePassword(): string {
	return randomBytes(18).toString("base64url");
}

function logAdminCredentials(password: string) {
	console.info("Admin login credentials:");
	console.info(`username: ${BOOTSTRAP_ADMIN_USERNAME}`);
	console.info(`password: ${password}`);
}

async function getStoredPassword(): Promise<string | null> {
	const rows = await db
		.select({ value: appSettingsTable.value })
		.from(appSettingsTable)
		.where(eq(appSettingsTable.key, BOOTSTRAP_ADMIN_PASSWORD_KEY))
		.limit(1);
	return rows[0]?.value ?? null;
}

async function storePassword(password: string): Promise<void> {
	await db.insert(appSettingsTable).values({
		key: BOOTSTRAP_ADMIN_PASSWORD_KEY,
		value: password,
	});
}

async function findBootstrapAdmin() {
	const byEmail = await db
		.select({
			id: usersTable.id,
			role: usersTable.role,
		})
		.from(usersTable)
		.where(eq(usersTable.email, BOOTSTRAP_ADMIN_EMAIL))
		.limit(1);
	if (byEmail[0]) {
		return byEmail[0];
	}

	const byUsername = await db
		.select({
			id: usersTable.id,
			role: usersTable.role,
		})
		.from(usersTable)
		.where(eq(usersTable.username, BOOTSTRAP_ADMIN_USERNAME))
		.limit(1);
	return byUsername[0] ?? null;
}

async function setCredentialPassword(userId: string, password: string) {
	const hashed = await hashPassword(password);
	const existing = await db
		.select({ id: account.id })
		.from(account)
		.where(
			and(eq(account.userId, userId), eq(account.providerId, "credential")),
		)
		.limit(1);

	if (existing[0]) {
		await db
			.update(account)
			.set({ password: hashed })
			.where(eq(account.id, existing[0].id));
		return;
	}

	await db.insert(account).values({
		id: randomBytes(16).toString("hex"),
		accountId: userId,
		providerId: "credential",
		userId,
		password: hashed,
	});
}

/**
 * Ensure bootstrap admin exists once; persist plaintext password in
 * `app_setting` so every process start can reprint login credentials.
 */
export async function ensureFirstAdmin(
	authInstance: typeof auth,
): Promise<void> {
	let password = await getStoredPassword();
	const passwordWasMissing = password === null;
	if (!password) {
		password = generatePassword();
		await storePassword(password);
	}

	let admin = await findBootstrapAdmin();

	if (!admin) {
		await authInstance.api.signUpEmail({
			body: {
				name: BOOTSTRAP_ADMIN_NAME,
				email: BOOTSTRAP_ADMIN_EMAIL,
				password,
				username: BOOTSTRAP_ADMIN_USERNAME,
			},
		});
		admin = await findBootstrapAdmin();
		if (!admin) {
			throw new Error("Failed to create bootstrap admin user");
		}
	} else if (passwordWasMissing) {
		// Existing user but no stored bootstrap password — align credential hash.
		await setCredentialPassword(admin.id, password);
	}

	if (admin.role !== "admin") {
		await db
			.update(usersTable)
			.set({ role: "admin" })
			.where(eq(usersTable.id, admin.id));
	}

	logAdminCredentials(password);
}
