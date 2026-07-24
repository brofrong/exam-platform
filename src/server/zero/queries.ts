import { defineQueries, defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { requireCapability, requireUser } from "#/server/zero/authz";
import { zql } from "#/server/zero/schema";
import { can } from "#/shared/authz";

/**
 * Domain queries — admin catalog reads require capabilities.
 * Student reads require auth, enrollment, and published status.
 * Admins browsing student routes use the same enrollment rules.
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

	// ── Student (auth + enrollment + published) ──────────────────────────

	/** Published programs the current user is enrolled in (with outline). */
	publishedPrograms: defineQuery(({ ctx }) => {
		const user = requireUser(ctx);
		return zql.program
			.where("status", "published")
			.whereExists("enrollments", (q) => q.where("userId", user.id))
			.orderBy("createdAt", "desc")
			.related("topics", (q) =>
				q
					.where("status", "published")
					.orderBy("position", "asc")
					.related("topicLessons", (tl) =>
						tl
							.orderBy("position", "asc")
							.related("lesson", (lesson) =>
								lesson
									.where("status", "published")
									.related("activities", (a) => a.orderBy("position", "asc")),
							),
					),
			);
	}),

	/** One enrolled + published program with published topics/lessons. */
	publishedProgramById: defineQuery(
		z.object({ id: z.string() }),
		({ ctx, args }) => {
			const user = requireUser(ctx);
			return zql.program
				.where("id", args.id)
				.where("status", "published")
				.whereExists("enrollments", (q) => q.where("userId", user.id))
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

	/**
	 * Published lesson + activities, only if linked to a published topic
	 * inside a published program the user is enrolled in.
	 */
	publishedLessonById: defineQuery(
		z.object({ id: z.string() }),
		({ ctx, args }) => {
			const user = requireUser(ctx);
			return zql.lesson
				.where("id", args.id)
				.where("status", "published")
				.whereExists("topicLessons", (tl) =>
					tl.whereExists("topic", (topic) =>
						topic
							.where("status", "published")
							.whereExists("program", (program) =>
								program
									.where("status", "published")
									.whereExists("enrollments", (e) =>
										e.where("userId", user.id),
									),
							),
					),
				)
				.one()
				.related("activities", (q) => q.orderBy("position", "asc"));
		},
	),

	// ── Submissions (Task 21 UI) ──────────────────────────────────────────

	/** Student's own submissions for a practice activity. */
	mySubmissionsByActivity: defineQuery(
		z.object({ activityId: z.string() }),
		({ ctx, args }) => {
			const user = requireUser(ctx);
			return zql.submission
				.where("userId", user.id)
				.where("activityId", args.activityId)
				.orderBy("createdAt", "desc");
		},
	),

	/** Student's submissions across a program. */
	mySubmissionsByProgram: defineQuery(
		z.object({ programId: z.string() }),
		({ ctx, args }) => {
			const user = requireUser(ctx);
			return zql.submission
				.where("userId", user.id)
				.where("programId", args.programId)
				.orderBy("createdAt", "desc");
		},
	),

	/** Student's own submissions awaiting review (home «На проверке»). */
	myPendingSubmissions: defineQuery(({ ctx }) => {
		const user = requireUser(ctx);
		return zql.submission
			.where("userId", user.id)
			.where("status", "pending")
			.orderBy("createdAt", "desc")
			.related("activity")
			.related("program");
	}),

	/** Student's lesson progress rows (synced from progress mutators). */
	myLessonProgress: defineQuery(({ ctx }) => {
		const user = requireUser(ctx);
		return zql.lessonProgress
			.where("userId", user.id)
			.related("lesson")
			.related("program");
	}),

	/** Student's activity progress rows (synced from progress mutators). */
	myActivityProgress: defineQuery(({ ctx }) => {
		const user = requireUser(ctx);
		return zql.activityProgress
			.where("userId", user.id)
			.related("activity")
			.related("program");
	}),

	/** Admin pending review queue. */
	pendingSubmissions: defineQuery(({ ctx }) => {
		requireCapability(ctx, "submission:review");
		return zql.submission
			.where("status", "pending")
			.orderBy("createdAt", "asc")
			.related("activity")
			.related("program")
			.related("user");
	}),

	/** Reviewer: any submission. Student: own only. */
	submissionById: defineQuery(z.object({ id: z.string() }), ({ ctx, args }) => {
		const user = requireUser(ctx);
		const base = can(user.role, "submission:review")
			? zql.submission.where("id", args.id)
			: zql.submission.where("id", args.id).where("userId", user.id);
		return base.one().related("activity").related("program").related("user");
	}),

	// ── Invites (invite:create) ───────────────────────────────────────────

	programInvites: defineQuery(({ ctx }) => {
		requireCapability(ctx, "invite:create");
		return zql.programInvite
			.orderBy("createdAt", "desc")
			.related("programs", (q) => q.related("program"));
	}),

	/** Student's own enrollments with published programs only. */
	myEnrollments: defineQuery(({ ctx }) => {
		const user = requireUser(ctx);
		return zql.enrollment
			.where("userId", user.id)
			.whereExists("program", (q) => q.where("status", "published"))
			.related("program", (q) => q.where("status", "published"))
			.orderBy("createdAt", "desc");
	}),
});
