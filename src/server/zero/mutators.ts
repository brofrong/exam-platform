import { defineMutator, defineMutators } from "@rocicorp/zero";
import { z } from "zod";
import { requireCapability } from "#/server/zero/authz";
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
});
