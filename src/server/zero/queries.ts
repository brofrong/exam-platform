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

	/** Admin lesson picker — optional home program/topic filters. */
	lessonsByHome: defineQuery(
		z.object({
			homeProgramId: z.string().optional(),
			homeTopicId: z.string().optional(),
		}),
		({ ctx, args }) => {
			requireCapability(ctx, "lesson:write");
			let q = zql.lesson;
			if (args.homeProgramId) {
				q = q.where("homeProgramId", args.homeProgramId);
			}
			if (args.homeTopicId) {
				q = q.where("homeTopicId", args.homeTopicId);
			}
			return q.orderBy("title", "asc");
		},
	),

	/** Full admin outline for programs file-tree. */
	programsOutline: defineQuery(({ ctx }) => {
		requireCapability(ctx, "program:write");
		return zql.program
			.orderBy("createdAt", "desc")
			.related("topics", (q) =>
				q
					.orderBy("position", "asc")
					.related("topicLessons", (tl) =>
						tl.orderBy("position", "asc").related("lesson"),
					),
			);
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

	/** Published programs the current user is enrolled in OR public. */
	publishedPrograms: defineQuery(({ ctx }) => {
		const user = requireUser(ctx);
		return zql.program
			.where("status", "published")
			.where(({ or, cmp, exists }) =>
				or(
					cmp("public", true),
					exists("enrollments", (q) => q.where("userId", user.id)),
				),
			)
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

	/** One published program — enrolled OR public. */
	publishedProgramById: defineQuery(
		z.object({ id: z.string() }),
		({ ctx, args }) => {
			const user = requireUser(ctx);
			return zql.program
				.where("id", args.id)
				.where("status", "published")
				.where(({ or, cmp, exists }) =>
					or(
						cmp("public", true),
						exists("enrollments", (q) => q.where("userId", user.id)),
					),
				)
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
	 * inside a published program the user is enrolled in OR that is public.
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
									.where(({ or, cmp, exists }) =>
										or(
											cmp("public", true),
											exists("enrollments", (e) => e.where("userId", user.id)),
										),
									),
							),
					),
				)
				.one()
				.related("activities", (q) => q.orderBy("position", "asc"));
		},
	),

	// ── Test groups / attempts ────────────────────────────────────────────

	/** Admin catalog of all test groups. */
	testGroups: defineQuery(({ ctx }) => {
		requireCapability(ctx, "lesson:write");
		return zql.testGroup
			.orderBy("title", "asc")
			.related("tests", (q) => q.orderBy("position", "asc"));
	}),

	/** Admin: group + tests + answer keys. */
	testGroupById: defineQuery(z.object({ id: z.string() }), ({ ctx, args }) => {
		requireCapability(ctx, "lesson:write");
		return zql.testGroup
			.where("id", args.id)
			.one()
			.related("tests", (q) =>
				q.orderBy("position", "asc").related("key").related("attemptAnswers"),
			);
	}),

	/** Admin: single test with key + answer stats rows. */
	testById: defineQuery(z.object({ id: z.string() }), ({ ctx, args }) => {
		requireCapability(ctx, "lesson:write");
		return zql.test
			.where("id", args.id)
			.one()
			.related("key")
			.related("attemptAnswers")
			.related("group");
	}),

	/**
	 * Student/admin: tests in a group without answer keys.
	 * Used to sample attempts and render prompts.
	 */
	testsByGroupId: defineQuery(
		z.object({ groupId: z.string() }),
		({ ctx, args }) => {
			requireUser(ctx);
			return zql.test.where("groupId", args.groupId).orderBy("position", "asc");
		},
	),

	/** Student's attempts for a practice activity. */
	myAttemptsByActivity: defineQuery(
		z.object({ activityId: z.string() }),
		({ ctx, args }) => {
			const user = requireUser(ctx);
			return zql.testAttempt
				.where("userId", user.id)
				.where("activityId", args.activityId)
				.orderBy("createdAt", "desc")
				.related("answers");
		},
	),

	/** Student's pending-review attempts (home «На проверке»). */
	myPendingAttempts: defineQuery(({ ctx }) => {
		const user = requireUser(ctx);
		return zql.testAttempt
			.where("userId", user.id)
			.where("status", "pending_review")
			.orderBy("createdAt", "desc")
			.related("activity")
			.related("program");
	}),

	/** Admin pending review queue. */
	pendingAttempts: defineQuery(({ ctx }) => {
		requireCapability(ctx, "submission:review");
		return zql.testAttempt
			.where("status", "pending_review")
			.orderBy("createdAt", "asc")
			.related("activity")
			.related("program")
			.related("user")
			.related("answers");
	}),

	/** Reviewer: any attempt. Student: own only. */
	attemptById: defineQuery(z.object({ id: z.string() }), ({ ctx, args }) => {
		const user = requireUser(ctx);
		const base = can(user.role, "submission:review")
			? zql.testAttempt.where("id", args.id)
			: zql.testAttempt.where("id", args.id).where("userId", user.id);
		return base
			.one()
			.related("activity")
			.related("program")
			.related("user")
			.related("answers");
	}),

	/** Tests by ids (no keys) — for attempt player / review display. */
	testsByIds: defineQuery(
		z.object({ ids: z.array(z.string()).min(1) }),
		({ ctx, args }) => {
			requireUser(ctx);
			return zql.test.where("id", "IN", args.ids);
		},
	),

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

	/** All public published programs (for catalog / discovery). */
	publicPrograms: defineQuery(({ ctx }) => {
		requireUser(ctx);
		return zql.program
			.where("status", "published")
			.where("public", true)
			.orderBy("createdAt", "desc");
	}),

	// ── Support chat ──────────────────────────────────────────────────────

	/** Student's own support thread with messages (may be null before first send). */
	mySupportThread: defineQuery(({ ctx }) => {
		const user = requireUser(ctx);
		return zql.supportThread
			.where("studentUserId", user.id)
			.one()
			.related("messages", (q) =>
				q.orderBy("createdAt", "asc").related("author"),
			);
	}),

	/** Admin inbox: all threads with student + messages (newest first). */
	supportThreads: defineQuery(({ ctx }) => {
		requireCapability(ctx, "support:reply");
		return zql.supportThread
			.orderBy("createdAt", "desc")
			.related("student")
			.related("messages", (q) => q.orderBy("createdAt", "desc"));
	}),

	/** Thread detail: owner student or admin with support:reply. */
	supportThreadById: defineQuery(
		z.object({ id: z.string() }),
		({ ctx, args }) => {
			const user = requireUser(ctx);
			const base = can(user.role, "support:reply")
				? zql.supportThread.where("id", args.id)
				: zql.supportThread
						.where("id", args.id)
						.where("studentUserId", user.id);
			return base
				.one()
				.related("student")
				.related("messages", (q) =>
					q.orderBy("createdAt", "asc").related("author"),
				);
		},
	),

	// ── Analytics (analytics:read) ────────────────────────────────────────

	/** All enrollments with student + program for the analytics table. */
	analyticsEnrollments: defineQuery(({ ctx }) => {
		requireCapability(ctx, "analytics:read");
		return zql.enrollment
			.orderBy("createdAt", "desc")
			.related("user")
			.related("program");
	}),

	/** Program outlines (topics → lessons → activities) for progress %. */
	analyticsProgramOutlines: defineQuery(({ ctx }) => {
		requireCapability(ctx, "analytics:read");
		return zql.program
			.orderBy("createdAt", "desc")
			.related("topics", (q) =>
				q
					.orderBy("position", "asc")
					.related("topicLessons", (tl) =>
						tl
							.orderBy("position", "asc")
							.related("lesson", (lesson) =>
								lesson.related("activities", (a) =>
									a.orderBy("position", "asc"),
								),
							),
					),
			);
	}),

	/** All lesson progress rows (admin analytics). */
	analyticsLessonProgress: defineQuery(({ ctx }) => {
		requireCapability(ctx, "analytics:read");
		return zql.lessonProgress
			.related("lesson")
			.related("user")
			.related("program");
	}),

	/** All activity progress rows (admin analytics + last activity). */
	analyticsActivityProgress: defineQuery(({ ctx }) => {
		requireCapability(ctx, "analytics:read");
		return zql.activityProgress
			.related("activity")
			.related("user")
			.related("program");
	}),
});
