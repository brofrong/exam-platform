import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import {
	buildObjectKey,
	isAllowedContentType,
	isUploadPurpose,
	MAX_UPLOAD_BYTES,
	putObject,
} from "#/server/storage";
import { can } from "#/shared/authz";

export const Route = createFileRoute("/api/upload")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}

				let formData: FormData;
				try {
					formData = await request.formData();
				} catch {
					return Response.json(
						{ error: "Expected multipart form data" },
						{ status: 400 },
					);
				}

				const purposeRaw =
					formData.get("purpose") ?? formData.get("folder") ?? "";
				const purpose = typeof purposeRaw === "string" ? purposeRaw.trim() : "";
				if (!isUploadPurpose(purpose)) {
					return Response.json(
						{
							error: `Invalid purpose. Expected one of: editor, submissions`,
						},
						{ status: 400 },
					);
				}

				if (purpose === "editor" && !can(user.role, "lesson:write")) {
					return Response.json({ error: "Forbidden" }, { status: 403 });
				}

				const fileEntry = formData.get("file");
				if (!(fileEntry instanceof File)) {
					return Response.json(
						{ error: "Missing file field" },
						{ status: 400 },
					);
				}

				if (fileEntry.size <= 0) {
					return Response.json({ error: "Empty file" }, { status: 400 });
				}

				if (fileEntry.size > MAX_UPLOAD_BYTES) {
					return Response.json(
						{ error: `File too large (max ${MAX_UPLOAD_BYTES} bytes)` },
						{ status: 413 },
					);
				}

				const contentType =
					fileEntry.type && fileEntry.type.length > 0
						? fileEntry.type
						: "application/octet-stream";
				if (!isAllowedContentType(contentType)) {
					return Response.json(
						{ error: `Unsupported content type: ${contentType}` },
						{ status: 415 },
					);
				}

				const key = buildObjectKey(purpose, user.id, fileEntry.name);
				const body = new Uint8Array(await fileEntry.arrayBuffer());

				await putObject({ key, body, contentType });

				return Response.json({ key });
			},
		},
	},
});
