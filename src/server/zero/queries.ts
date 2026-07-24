import { defineQueries, defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { requireCapability, requireUser } from "#/server/zero/authz";
import { zql } from "#/server/zero/schema";

/**
 * Domain queries — admin catalog reads require capabilities.
 * Student-scoped filters land in later tasks.
 */
export const queries = defineQueries({
	me: defineQuery(({ ctx }) => {
		const user = requireUser(ctx);
		return zql.user.where("id", user.id).one();
	}),

	programs: defineQuery(({ ctx }) => {
		requireCapability(ctx, "program:write");
		return zql.program.orderBy("createdAt", "desc");
	}),

	programById: defineQuery(z.object({ id: z.string() }), ({ ctx, args }) => {
		requireCapability(ctx, "program:write");
		return zql.program
			.where("id", args.id)
			.one()
			.related("topics", (q) =>
				q
					.orderBy("position", "asc")
					.related("topicLessons", (tl) =>
						tl.orderBy("position", "asc").related("lesson"),
					),
			);
	}),

	topicsByProgram: defineQuery(
		z.object({ programId: z.string() }),
		({ ctx, args }) => {
			requireCapability(ctx, "program:write");
			return zql.topic
				.where("programId", args.programId)
				.orderBy("position", "asc")
				.related("topicLessons", (q) =>
					q.orderBy("position", "asc").related("lesson"),
				);
		},
	),

	topicLessonsByTopic: defineQuery(
		z.object({ topicId: z.string() }),
		({ ctx, args }) => {
			requireCapability(ctx, "program:write");
			return zql.topicLesson
				.where("topicId", args.topicId)
				.orderBy("position", "asc")
				.related("lesson");
		},
	),

	lessons: defineQuery(({ ctx }) => {
		requireCapability(ctx, "lesson:write");
		return zql.lesson.orderBy("title", "asc");
	}),

	lessonById: defineQuery(z.object({ id: z.string() }), ({ ctx, args }) => {
		requireCapability(ctx, "lesson:write");
		return zql.lesson
			.where("id", args.id)
			.one()
			.related("activities", (q) => q.orderBy("position", "asc"));
	}),

	activitiesByLesson: defineQuery(
		z.object({ lessonId: z.string() }),
		({ ctx, args }) => {
			requireCapability(ctx, "lesson:write");
			return zql.activity
				.where("lessonId", args.lessonId)
				.orderBy("position", "asc");
		},
	),

	activityById: defineQuery(z.object({ id: z.string() }), ({ ctx, args }) => {
		requireCapability(ctx, "lesson:write");
		return zql.activity.where("id", args.id).one();
	}),
});
