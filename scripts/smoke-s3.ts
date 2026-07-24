/**
 * Smoke-test MinIO / S3: put → signed GET → delete.
 *
 * Usage (dev stack up):
 *   bun --env-file=.env run scripts/smoke-s3.ts
 *
 * Usage (e2e stack):
 *   bun --env-file=.env.e2e run scripts/smoke-s3.ts
 */
import {
	deleteObject,
	getSignedGetUrl,
	putObject,
} from "#/server/storage";

const key = `smoke/${Date.now()}.txt`;
const body = `smoke-ok ${new Date().toISOString()}`;

console.log("putObject", key);
await putObject({ key, body, contentType: "text/plain" });

const url = await getSignedGetUrl({ key, expiresIn: 60 });
console.log("getSignedGetUrl", url);

const response = await fetch(url);
if (!response.ok) {
	throw new Error(`signed GET failed: ${response.status} ${response.statusText}`);
}
const text = await response.text();
if (text !== body) {
	throw new Error(`body mismatch: expected ${JSON.stringify(body)}, got ${JSON.stringify(text)}`);
}
console.log("signed GET ok");

await deleteObject({ key });
console.log("deleteObject ok");
console.log("smoke-s3 passed");
