import { defineQueries, defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { requireCapability, requireUser } from "#/server/zero/authz";
import { zql } from "#/server/zero/schema";

/**
 * Domain queries — admin catalog reads require capabilities.
 * Student reads require auth and published status (enrollment in Task 23).
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

	// ── Student (auth + published; enrollment filter in Task 23) ─────────

	/** TODO(Task 23): gate by enrollment, not only published status. */
	publishedPrograms: defineQuery(({ ctx }) => {
		requireUser(ctx);
		return zql.program
			.where("status", "published")
			.orderBy("createdAt", "desc");
	}),

	/** TODO(Task 23): gate by enrollment, not only published status. */
	publishedProgramById: defineQuery(
		z.object({ id: z.string() }),
		({ ctx, args }) => {
			requireUser(ctx);
			return zql.program
				.where("id", args.id)
				.where("status", "published")
				.one()
				.related("topics", (q) =>
					q
						.where("status", "published")
						.orderBy("position", "asc")
						.related("topicLessons", (tl) =>
							tl
								.orderBy("position", "asc")
								.related("lesson", (lesson) =>
									lesson.where("status", "published"),
								),
						),
				);
		},
	),

	/** TODO(Task 23): gate by enrollment / program membership. */
	publishedLessonById: defineQuery(
		z.object({ id: z.string() }),
		({ ctx, args }) => {
			requireUser(ctx);
			return zql.lesson
				.where("id", args.id)
				.where("status", "published")
				.one()
				.related("activities", (q) => q.orderBy("position", "asc"));
		},
	),
});
