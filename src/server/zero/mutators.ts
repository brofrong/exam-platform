import { defineMutator, defineMutators } from "@rocicorp/zero";
import { z } from "zod";
import {
	applyReviewResults,
	type GradedAnswers,
	gradeSubmission,
	markAnswersPending,
	type StudentAnswers,
} from "#/server/grading/grade-submission";
import { requireCapability, requireUser } from "#/server/zero/authz";
import {
	ACTIVITY_TYPES,
	EMPTY_TIPTAP_DOC,
	PUBLISH_STATUSES,
} from "#/server/zero/constants";
import { aggregateLessonProgress } from "#/server/zero/recompute-lesson-progress";
import { zql } from "#/server/zero/schema";
import { can } from "#/shared/authz";

const publishStatusSchema = z.enum(PUBLISH_STATUSES);
const activityTypeSchema = z.enum(ACTIVITY_TYPES);
/** TipTap JSON document — must be JSON-serializable for Zero mutator args. */
const activityContentSchema = z.record(z.string(), z.json());

const shortTextAnswerSchema = z.object({
	type: z.literal("short_text"),
	value: z.string(),
});
const singleChoiceAnswerSchema = z.object({
	type: z.literal("single_choice"),
	optionId: z.string(),
});
const multipleChoiceAnswerSchema = z.object({
	type: z.literal("multiple_choice"),
	optionIds: z.array(z.string()),
});
const fileUploadAnswerSchema = z.object({
	type: z.literal("file_upload"),
	storageKey: z.string().min(1),
	filename: z.string().min(1),
	mime: z.string().min(1),
	size: z.number().int().nonnegative(),
});
const studentAnswerSchema = z.discriminatedUnion("type", [
	shortTextAnswerSchema,
	singleChoiceAnswerSchema,
	multipleChoiceAnswerSchema,
	fileUploadAnswerSchema,
]);
const studentAnswersSchema = z.record(z.string(), studentAnswerSchema);

const reviewResultSchema = z.enum(["correct", "incorrect"]);

function newId(id: string | undefined): string {
	return id ?? crypto.randomUUID();
}

/** Minimal tx surface used by progress writers (avoids exporting Zero Transaction). */
type MutatorTx = {
	run: <T>(query: T) => Promise<unknown>;
	mutate: {
		activityProgress: {
			upsert: (row: {
				userId: string;
				programId: string;
				activityId: string;
				status: string;
				videoPositionSec?: number | null;
				videoPercent?: number | null;
				completedAt?: number | null;
			}) => Promise<void>;
			update: (row: {
				userId: string;
				programId: string;
				activityId: string;
				status?: string;
				videoPositionSec?: number | null;
				videoPercent?: number | null;
				completedAt?: number | null;
			}) => Promise<void>;
		};
		lessonProgress: {
			upsert: (row: {
				userId: string;
				programId: string;
				lessonId: string;
				status: string;
				percent: number;
				completedAt?: number | null;
			}) => Promise<void>;
		};
	};
};

async function requireEnrollment(
	tx: MutatorTx,
	userId: string,
	programId: string,
) {
	const enrollment = (await tx.run(
		zql.enrollment.where("userId", userId).where("programId", programId).one(),
	)) as { id: string } | undefined;
	if (!enrollment) {
		throw new Error("Forbidden");
	}
	return enrollment;
}

async function requireActivityInProgram(
	tx: MutatorTx,
	activityId: string,
	programId: string,
) {
	const activity = (await tx.run(zql.activity.where("id", activityId).one())) as
		| { id: string; lessonId: string; type: string; content: unknown }
		| undefined;
	if (!activity) {
		throw new Error("Not found");
	}

	const topics = (await tx.run(
		zql.topic.where("programId", programId),
	)) as Array<{ id: string }>;
	const topicIds = new Set(topics.map((topic) => topic.id));
	const links = (await tx.run(
		zql.topicLesson.where("lessonId", activity.lessonId),
	)) as Array<{ topicId: string }>;
	if (!links.some((link) => topicIds.has(link.topicId))) {
		throw new Error("Forbidden");
	}
	return activity;
}

async function recomputeLessonProgress(
	tx: MutatorTx,
	userId: string,
	programId: string,
	lessonId: string,
	now: number,
) {
	const activities = (await tx.run(
		zql.activity.where("lessonId", lessonId),
	)) as Array<{ id: string }>;
	const activityIds = new Set(activities.map((activity) => activity.id));
	const progressRows = (await tx.run(
		zql.activityProgress.where("userId", userId).where("programId", programId),
	)) as Array<{ activityId: string; status: string }>;
	const completedCount = progressRows.filter(
		(row) => activityIds.has(row.activityId) && row.status === "completed",
	).length;
	const aggregate = aggregateLessonProgress(
		activities.length,
		completedCount,
		now,
	);
	await tx.mutate.lessonProgress.upsert({
		userId,
		programId,
		lessonId,
		status: aggregate.status,
		percent: aggregate.percent,
		completedAt: aggregate.completedAt,
	});
}

async function upsertActivityProgress(
	tx: MutatorTx,
	input: {
		userId: string;
		programId: string;
		activityId: string;
		lessonId: string;
		status: "in_progress" | "completed";
		videoPositionSec?: number | null;
		videoPercent?: number | null;
		now: number;
	},
) {
	const existing = (await tx.run(
		zql.activityProgress
			.where("userId", input.userId)
			.where("programId", input.programId)
			.where("activityId", input.activityId)
			.one(),
	)) as
		| {
				status: string;
				videoPositionSec: number | null;
				videoPercent: number | null;
				completedAt: number | null;
		  }
		| undefined;

	const alreadyCompleted = existing?.status === "completed";
	const nextStatus =
		alreadyCompleted || input.status === "completed"
			? "completed"
			: "in_progress";
	const videoPositionSec =
		input.videoPositionSec !== undefined
			? input.videoPositionSec
			: (existing?.videoPositionSec ?? null);
	const videoPercent =
		input.videoPercent !== undefined
			? input.videoPercent
			: (existing?.videoPercent ?? null);
	const completedAt =
		nextStatus === "completed" ? (existing?.completedAt ?? input.now) : null;

	await tx.mutate.activityProgress.upsert({
		userId: input.userId,
		programId: input.programId,
		activityId: input.activityId,
		status: nextStatus,
		videoPositionSec,
		videoPercent,
		completedAt,
	});
	await recomputeLessonProgress(
		tx,
		input.userId,
		input.programId,
		input.lessonId,
		input.now,
	);
}

export const mutators = defineMutators({
	// ── Program (program:write) ───────────────────────────────────────────

	createProgram: defineMutator(
		z.object({
			id: z.string().optional(),
			title: z.string().min(1).max(255),
			description: z.string().max(4000).nullable().optional(),
			examType: z.string().min(1).max(64),
			subject: z.string().min(1).max(128),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			const now = Date.now();
			await tx.mutate.program.insert({
				id: newId(args.id),
				title: args.title,
				description: args.description ?? null,
				examType: args.examType,
				subject: args.subject,
				status: "draft",
				createdAt: now,
				updatedAt: now,
			});
		},
	),

	updateProgram: defineMutator(
		z.object({
			id: z.string(),
			title: z.string().min(1).max(255).optional(),
			description: z.string().max(4000).nullable().optional(),
			examType: z.string().min(1).max(64).optional(),
			subject: z.string().min(1).max(128).optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			await tx.mutate.program.update({
				id: args.id,
				title: args.title,
				description: args.description,
				examType: args.examType,
				subject: args.subject,
				updatedAt: Date.now(),
			});
		},
	),

	publishProgram: defineMutator(
		z.object({
			id: z.string(),
			status: publishStatusSchema,
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			await tx.mutate.program.update({
				id: args.id,
				status: args.status,
				updatedAt: Date.now(),
			});
		},
	),

	// ── Topic (program:write) ─────────────────────────────────────────────

	createTopic: defineMutator(
		z.object({
			id: z.string().optional(),
			programId: z.string(),
			title: z.string().min(1).max(255),
			position: z.number().int().nonnegative(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			await tx.mutate.topic.insert({
				id: newId(args.id),
				programId: args.programId,
				title: args.title,
				position: args.position,
				status: "draft",
			});
		},
	),

	updateTopic: defineMutator(
		z.object({
			id: z.string(),
			title: z.string().min(1).max(255).optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			await tx.mutate.topic.update({
				id: args.id,
				title: args.title,
			});
		},
	),

	reorderTopics: defineMutator(
		z.object({
			programId: z.string(),
			orderedIds: z.array(z.string()).min(1),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			for (const [position, id] of args.orderedIds.entries()) {
				const topic = await tx.run(zql.topic.where("id", id).one());
				if (!topic || topic.programId !== args.programId) {
					throw new Error("Forbidden");
				}
				await tx.mutate.topic.update({ id, position });
			}
		},
	),

	publishTopic: defineMutator(
		z.object({
			id: z.string(),
			status: publishStatusSchema,
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			await tx.mutate.topic.update({
				id: args.id,
				status: args.status,
			});
		},
	),

	// ── Topic ↔ lesson link (program:write) ───────────────────────────────

	linkTopicLesson: defineMutator(
		z.object({
			topicId: z.string(),
			lessonId: z.string(),
			position: z.number().int().nonnegative(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			await tx.mutate.topicLesson.insert({
				topicId: args.topicId,
				lessonId: args.lessonId,
				position: args.position,
			});
		},
	),

	unlinkTopicLesson: defineMutator(
		z.object({
			topicId: z.string(),
			lessonId: z.string(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			await tx.mutate.topicLesson.delete({
				topicId: args.topicId,
				lessonId: args.lessonId,
			});
		},
	),

	reorderTopicLessons: defineMutator(
		z.object({
			topicId: z.string(),
			orderedLessonIds: z.array(z.string()).min(1),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			for (const [position, lessonId] of args.orderedLessonIds.entries()) {
				const link = await tx.run(
					zql.topicLesson
						.where("topicId", args.topicId)
						.where("lessonId", lessonId)
						.one(),
				);
				if (!link) {
					throw new Error("Forbidden");
				}
				await tx.mutate.topicLesson.update({
					topicId: args.topicId,
					lessonId,
					position,
				});
			}
		},
	),

	// ── Lesson (lesson:write) ─────────────────────────────────────────────

	createLesson: defineMutator(
		z.object({
			id: z.string().optional(),
			title: z.string().min(1).max(255),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			await tx.mutate.lesson.insert({
				id: newId(args.id),
				title: args.title,
				status: "draft",
			});
		},
	),

	updateLesson: defineMutator(
		z.object({
			id: z.string(),
			title: z.string().min(1).max(255).optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			await tx.mutate.lesson.update({
				id: args.id,
				title: args.title,
			});
		},
	),

	publishLesson: defineMutator(
		z.object({
			id: z.string(),
			status: publishStatusSchema,
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			await tx.mutate.lesson.update({
				id: args.id,
				status: args.status,
			});
		},
	),

	// ── Activity (lesson:write) ───────────────────────────────────────────

	createActivity: defineMutator(
		z.object({
			id: z.string().optional(),
			lessonId: z.string(),
			type: activityTypeSchema,
			position: z.number().int().nonnegative(),
			content: activityContentSchema.optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			await tx.mutate.activity.insert({
				id: newId(args.id),
				lessonId: args.lessonId,
				type: args.type,
				position: args.position,
				content: args.content ?? EMPTY_TIPTAP_DOC,
			});
		},
	),

	updateActivity: defineMutator(
		z.object({
			id: z.string(),
			type: activityTypeSchema.optional(),
			content: activityContentSchema.optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			await tx.mutate.activity.update({
				id: args.id,
				type: args.type,
				content: args.content,
			});
		},
	),

	reorderActivities: defineMutator(
		z.object({
			lessonId: z.string(),
			orderedIds: z.array(z.string()).min(1),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			for (const [position, id] of args.orderedIds.entries()) {
				const activity = await tx.run(zql.activity.where("id", id).one());
				if (!activity || activity.lessonId !== args.lessonId) {
					throw new Error("Forbidden");
				}
				await tx.mutate.activity.update({ id, position });
			}
		},
	),

	// ── Practice submissions ──────────────────────────────────────────────

	/**
	 * Student practice submit. Auth required. Authoritative grading runs on
	 * the server against full activity.content (includes correctAnswer).
	 */
	submitPractice: defineMutator(
		z.object({
			id: z.string().optional(),
			programId: z.string(),
			activityId: z.string(),
			answers: studentAnswersSchema,
		}),
		async ({ ctx, args, tx }) => {
			const user = requireUser(ctx);
			await requireEnrollment(tx as MutatorTx, user.id, args.programId);
			const activity = await requireActivityInProgram(
				tx as MutatorTx,
				args.activityId,
				args.programId,
			);
			if (activity.type !== "practice") {
				throw new Error("Not found");
			}

			const studentAnswers = args.answers as StudentAnswers;
			const graded =
				tx.location === "server"
					? gradeSubmission(activity.content, studentAnswers)
					: {
							status: "pending" as const,
							answers: markAnswersPending(studentAnswers),
						};

			const now = Date.now();
			await tx.mutate.submission.insert({
				id: newId(args.id),
				userId: user.id,
				programId: args.programId,
				activityId: args.activityId,
				answers: graded.answers,
				status: graded.status,
				reviewedBy: null,
				reviewerComment: null,
				reviewedAt: null,
				createdAt: now,
				updatedAt: now,
			});

			await upsertActivityProgress(tx as MutatorTx, {
				userId: user.id,
				programId: args.programId,
				activityId: args.activityId,
				lessonId: activity.lessonId,
				status: "completed",
				now,
			});
		},
	),

	/**
	 * Admin review: set per-question correct/incorrect + optional comment.
	 * Requires `submission:review`.
	 */
	reviewSubmission: defineMutator(
		z.object({
			submissionId: z.string(),
			results: z.record(z.string(), reviewResultSchema).optional(),
			result: reviewResultSchema.optional(),
			questionId: z.string().optional(),
			comment: z.string().max(8000).nullable().optional(),
		}),
		async ({ ctx, args, tx }) => {
			const reviewer = requireCapability(ctx, "submission:review");
			const submission = await tx.run(
				zql.submission.where("id", args.submissionId).one(),
			);
			if (!submission) {
				throw new Error("Not found");
			}

			const results: Record<string, "correct" | "incorrect"> = {
				...(args.results ?? {}),
			};
			if (args.questionId && args.result) {
				results[args.questionId] = args.result;
			}
			if (Object.keys(results).length === 0) {
				throw new Error("Invalid args");
			}

			const reviewed = applyReviewResults(
				submission.answers as GradedAnswers,
				results,
			);
			const now = Date.now();
			await tx.mutate.submission.update({
				id: args.submissionId,
				answers: reviewed.answers,
				status: reviewed.status,
				reviewedBy: reviewer.id,
				reviewerComment:
					args.comment === undefined
						? submission.reviewerComment
						: args.comment,
				reviewedAt: now,
				updatedAt: now,
			});
		},
	),

	// ── Invites (invite:create) ───────────────────────────────────────────

	createProgramInvite: defineMutator(
		z.object({
			id: z.string().optional(),
			token: z.string().min(8).max(128).optional(),
			programIds: z.array(z.string().min(1)).min(1),
			inviteeEmail: z.string().email().nullable().optional(),
			inviteeName: z.string().max(255).nullable().optional(),
			expiresAt: z.number().int().positive().nullable().optional(),
		}),
		async ({ ctx, args, tx }) => {
			const user = requireCapability(ctx, "invite:create");
			const id = newId(args.id);
			const token = args.token ?? crypto.randomUUID();
			const now = Date.now();
			await tx.mutate.programInvite.insert({
				id,
				token,
				createdByUserId: user.id,
				inviteeEmail: args.inviteeEmail ?? null,
				inviteeName: args.inviteeName ?? null,
				expiresAt: args.expiresAt ?? null,
				usedAt: null,
				usedByUserId: null,
				createdAt: now,
			});
			for (const programId of args.programIds) {
				await tx.mutate.programInviteProgram.insert({
					inviteId: id,
					programId,
				});
			}
		},
	),

	// ── Student progress ──────────────────────────────────────────────────

	/**
	 * Mark a theory (or any) activity completed — «Изучено» /
	 * «Отметить просмотренным». Upserts activity_progress and recomputes
	 * lesson_progress.percent = completed / total activities in the lesson.
	 */
	markActivityStudied: defineMutator(
		z.object({
			activityId: z.string(),
			programId: z.string(),
			videoPositionSec: z.number().int().nonnegative().nullable().optional(),
			videoPercent: z.number().min(0).max(100).nullable().optional(),
		}),
		async ({ ctx, args, tx }) => {
			const user = requireUser(ctx);
			await requireEnrollment(tx as MutatorTx, user.id, args.programId);
			const activity = await requireActivityInProgram(
				tx as MutatorTx,
				args.activityId,
				args.programId,
			);
			const now = Date.now();
			await upsertActivityProgress(tx as MutatorTx, {
				userId: user.id,
				programId: args.programId,
				activityId: args.activityId,
				lessonId: activity.lessonId,
				status: "completed",
				videoPositionSec: args.videoPositionSec,
				videoPercent: args.videoPercent,
				now,
			});
		},
	),

	/**
	 * Best-effort video position. VK/YouTube iframes usually do not expose
	 * reliable postMessage progress under sandbox — callers may still push
	 * position when available; otherwise use markActivityStudied /
	 * «Отметить просмотренным». Does not demote an already-completed row.
	 */
	updateVideoProgress: defineMutator(
		z.object({
			activityId: z.string(),
			programId: z.string(),
			videoPositionSec: z.number().int().nonnegative().optional(),
			videoPercent: z.number().min(0).max(100).optional(),
			completed: z.boolean().optional(),
		}),
		async ({ ctx, args, tx }) => {
			const user = requireUser(ctx);
			await requireEnrollment(tx as MutatorTx, user.id, args.programId);
			const activity = await requireActivityInProgram(
				tx as MutatorTx,
				args.activityId,
				args.programId,
			);
			const now = Date.now();
			const markComplete =
				args.completed === true ||
				(args.videoPercent !== undefined && args.videoPercent >= 95);
			await upsertActivityProgress(tx as MutatorTx, {
				userId: user.id,
				programId: args.programId,
				activityId: args.activityId,
				lessonId: activity.lessonId,
				status: markComplete ? "completed" : "in_progress",
				videoPositionSec: args.videoPositionSec,
				videoPercent: args.videoPercent,
				now,
			});
		},
	),

	// ── Support chat ──────────────────────────────────────────────────────

	/**
	 * Send a support message. Students auto-create their one thread on first
	 * send. Admins with `support:reply` reply to an existing `threadId`.
	 */
	sendSupportMessage: defineMutator(
		z.object({
			body: z.string().min(1).max(8000),
			threadId: z.string().optional(),
			messageId: z.string().optional(),
		}),
		async ({ ctx, args, tx }) => {
			const user = requireUser(ctx);
			const body = args.body.trim();
			if (body.length === 0) {
				throw new Error("Empty message");
			}

			const now = Date.now();
			const messageId = newId(args.messageId);
			const canReply = can(user.role, "support:reply");
			let threadId: string;

			if (args.threadId) {
				const thread = (await tx.run(
					zql.supportThread.where("id", args.threadId).one(),
				)) as { id: string; studentUserId: string } | undefined;
				if (!thread) {
					throw new Error("Thread not found");
				}
				if (thread.studentUserId !== user.id && !canReply) {
					throw new Error("Forbidden");
				}
				threadId = thread.id;
			} else {
				const existing = (await tx.run(
					zql.supportThread.where("studentUserId", user.id).one(),
				)) as { id: string } | undefined;
				if (existing) {
					threadId = existing.id;
				} else {
					threadId = newId(undefined);
					await tx.mutate.supportThread.insert({
						id: threadId,
						studentUserId: user.id,
						createdAt: now,
					});
				}
			}

			await tx.mutate.supportMessage.insert({
				id: messageId,
				threadId,
				authorId: user.id,
				body,
				createdAt: now,
			});
		},
	),
});
