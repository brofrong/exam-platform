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
import { zql } from "#/server/zero/schema";

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
			const activity = await tx.run(
				zql.activity.where("id", args.activityId).one(),
			);
			if (!activity || activity.type !== "practice") {
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

	// ── Student progress (stub until Task 25) ─────────────────────────────

	/** TODO(Task 25): persist activity_progress / lesson_progress. */
	markActivityStudied: defineMutator(
		z.object({
			activityId: z.string(),
		}),
		async ({ ctx, args }) => {
			requireUser(ctx);
			console.info(
				"[progress stub] markActivityStudied",
				args.activityId,
				"user",
				ctx.id,
			);
		},
	),
});
