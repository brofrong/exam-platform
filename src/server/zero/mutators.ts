import { defineMutator, defineMutators } from "@rocicorp/zero";
import { z } from "zod";
import { assertAcyclicEdges } from "#/features/program-locks/lib/lock-graph";
import { resolveLessonAccess } from "#/features/program-locks/lib/resolve-access";
import type { ZeroContext } from "#/server/auth/types";
import {
	isPracticeActivityContent,
	type PracticeActivityContent,
} from "#/server/db/activity/practice-content";
import {
	applyReviewResults,
	finalizeAttemptScore,
	type GradedAnswer,
	type GradedAnswers,
	gradeAttempt,
	markAnswersPending,
	type StudentAnswers,
} from "#/server/grading/grade-attempt";
import { requireCapability, requireUser } from "#/server/zero/authz";
import {
	ACTIVITY_TYPES,
	EMPTY_TIPTAP_DOC,
	LOCK_MODES,
	PUBLISH_STATUSES,
	TEST_ANSWER_TYPES,
	TEST_GRADING,
} from "#/server/zero/constants";
import { aggregateLessonProgress } from "#/server/zero/recompute-lesson-progress";
import { zql } from "#/server/zero/schema";
import { can } from "#/shared/authz";

const publishStatusSchema = z.enum(PUBLISH_STATUSES);
const lockModeSchema = z.enum(LOCK_MODES);
const activityTypeSchema = z.enum(ACTIVITY_TYPES);
/** TipTap JSON document — must be JSON-serializable for Zero mutator args. */
const activityContentSchema = z.record(z.string(), z.json());

const shortTextAnswerSchema = z.object({
	type: z.literal("short_text"),
	value: z.string(),
});
const numberAnswerSchema = z.object({
	type: z.literal("number"),
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
	numberAnswerSchema,
	singleChoiceAnswerSchema,
	multipleChoiceAnswerSchema,
	fileUploadAnswerSchema,
]);
const studentAnswersSchema = z.record(z.string(), studentAnswerSchema);

const reviewResultSchema = z.enum(["correct", "incorrect"]);
const testAnswerTypeSchema = z.enum(TEST_ANSWER_TYPES);
const testGradingSchema = z.enum(TEST_GRADING);

function newId(id: string | undefined): string {
	return id ?? crypto.randomUUID();
}

function sampleIds(ids: string[], count: number): string[] {
	const copy = [...ids];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const left = copy[i];
		const right = copy[j];
		if (left === undefined || right === undefined) {
			continue;
		}
		copy[i] = right;
		copy[j] = left;
	}
	return copy.slice(0, Math.min(count, copy.length));
}

function parsePracticeContent(content: unknown): PracticeActivityContent {
	if (!isPracticeActivityContent(content) || !content.testGroupId) {
		throw new Error("Practice not configured");
	}
	return content;
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

async function requireEnrollmentOrPublic(
	tx: MutatorTx,
	userId: string,
	programId: string,
) {
	const program = (await tx.run(zql.program.where("id", programId).one())) as
		| { id: string; public: boolean }
		| undefined;
	if (program?.public) return;

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

async function assertStudentCanProgressLesson(
	tx: MutatorTx,
	ctx: ZeroContext,
	programId: string,
	lessonId: string,
) {
	if (can(ctx.role, "program:write")) {
		return;
	}

	const program = (await tx.run(zql.program.where("id", programId).one())) as
		| {
				id: string;
				topicLockMode: string;
				lessonLockMode: string;
				unlockThresholdPercent: number;
		  }
		| undefined;
	if (!program) {
		throw new Error("Not found");
	}

	if (program.topicLockMode === "open" && program.lessonLockMode === "open") {
		return;
	}

	const topics = (await tx.run(
		zql.topic.where("programId", programId).orderBy("position", "asc"),
	)) as Array<{
		id: string;
		title: string;
		position: number;
		status: string;
	}>;

	const links: Array<{
		topicId: string;
		lessonId: string;
		position: number;
	}> = [];
	for (const topic of topics) {
		const topicLinks = (await tx.run(
			zql.topicLesson.where("topicId", topic.id),
		)) as Array<{ topicId: string; lessonId: string; position: number }>;
		links.push(...topicLinks);
	}

	const lessonById = new Map<
		string,
		{ id: string; title: string; status: string }
	>();
	for (const link of links) {
		if (lessonById.has(link.lessonId)) continue;
		const lesson = (await tx.run(
			zql.lesson.where("id", link.lessonId).one(),
		)) as { id: string; title: string; status: string } | undefined;
		if (lesson) {
			lessonById.set(lesson.id, lesson);
		}
	}

	const topicLockEdges = (await tx.run(
		zql.topicLockEdge.where("programId", programId),
	)) as Array<{ blockerTopicId: string; topicId: string }>;
	const lessonLockEdges = (await tx.run(
		zql.lessonLockEdge.where("programId", programId),
	)) as Array<{
		topicId: string;
		blockerLessonId: string;
		lessonId: string;
	}>;

	const progressRows = (await tx.run(
		zql.lessonProgress.where("userId", ctx.id).where("programId", programId),
	)) as Array<{ lessonId: string; percent: number }>;
	const lessonProgressById: Record<string, number> = {};
	for (const row of progressRows) {
		lessonProgressById[row.lessonId] = row.percent;
	}

	const access = resolveLessonAccess({
		program: {
			topicLockMode: program.topicLockMode,
			lessonLockMode: program.lessonLockMode,
			unlockThresholdPercent: program.unlockThresholdPercent,
			topics: topics.map((topic) => ({
				id: topic.id,
				title: topic.title,
				position: topic.position,
				topicLessons: links
					.filter((link) => link.topicId === topic.id)
					.map((link) => ({
						position: link.position,
						lesson: lessonById.get(link.lessonId) ?? null,
					})),
			})),
			topicLockEdges,
			lessonLockEdges,
		},
		lessonId,
		lessonProgressById,
	});

	if (!access.unlocked) {
		throw new Error("Lesson locked");
	}
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
			public: z.boolean().optional(),
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
				public: args.public ?? false,
				topicLockMode: "open",
				lessonLockMode: "open",
				unlockThresholdPercent: 80,
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
			public: z.boolean().optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			await tx.mutate.program.update({
				id: args.id,
				title: args.title,
				description: args.description,
				examType: args.examType,
				subject: args.subject,
				public: args.public,
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

	updateProgramLockSettings: defineMutator(
		z.object({
			id: z.string(),
			topicLockMode: lockModeSchema.optional(),
			lessonLockMode: lockModeSchema.optional(),
			unlockThresholdPercent: z.number().int().min(1).max(100).optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			await tx.mutate.program.update({
				id: args.id,
				topicLockMode: args.topicLockMode,
				lessonLockMode: args.lessonLockMode,
				unlockThresholdPercent: args.unlockThresholdPercent,
				updatedAt: Date.now(),
			});
		},
	),

	setTopicLockEdges: defineMutator(
		z.object({
			programId: z.string(),
			edges: z.array(
				z.object({
					id: z.string().optional(),
					blockerTopicId: z.string(),
					topicId: z.string(),
				}),
			),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			const topics = await tx.run(zql.topic.where("programId", args.programId));
			const topicIds = new Set(topics.map((topic) => topic.id));
			for (const edge of args.edges) {
				if (!topicIds.has(edge.blockerTopicId) || !topicIds.has(edge.topicId)) {
					throw new Error("Forbidden");
				}
			}
			assertAcyclicEdges(
				args.edges.map((edge) => ({
					from: edge.blockerTopicId,
					to: edge.topicId,
				})),
			);

			const existing = await tx.run(
				zql.topicLockEdge.where("programId", args.programId),
			);
			for (const row of existing) {
				await tx.mutate.topicLockEdge.delete({ id: row.id });
			}
			for (const edge of args.edges) {
				await tx.mutate.topicLockEdge.insert({
					id: newId(edge.id),
					programId: args.programId,
					blockerTopicId: edge.blockerTopicId,
					topicId: edge.topicId,
				});
			}
		},
	),

	setLessonLockEdges: defineMutator(
		z.object({
			programId: z.string(),
			topicId: z.string(),
			edges: z.array(
				z.object({
					id: z.string().optional(),
					blockerLessonId: z.string(),
					lessonId: z.string(),
				}),
			),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "program:write");
			const topic = await tx.run(zql.topic.where("id", args.topicId).one());
			if (!topic || topic.programId !== args.programId) {
				throw new Error("Forbidden");
			}
			const links = await tx.run(
				zql.topicLesson.where("topicId", args.topicId),
			);
			const lessonIds = new Set(links.map((link) => link.lessonId));
			for (const edge of args.edges) {
				if (
					!lessonIds.has(edge.blockerLessonId) ||
					!lessonIds.has(edge.lessonId)
				) {
					throw new Error("Forbidden");
				}
			}
			assertAcyclicEdges(
				args.edges.map((edge) => ({
					from: edge.blockerLessonId,
					to: edge.lessonId,
				})),
			);

			const existing = await tx.run(
				zql.lessonLockEdge
					.where("programId", args.programId)
					.where("topicId", args.topicId),
			);
			for (const row of existing) {
				await tx.mutate.lessonLockEdge.delete({ id: row.id });
			}
			for (const edge of args.edges) {
				await tx.mutate.lessonLockEdge.insert({
					id: newId(edge.id),
					programId: args.programId,
					topicId: args.topicId,
					blockerLessonId: edge.blockerLessonId,
					lessonId: edge.lessonId,
				});
			}
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
			homeProgramId: z.string().optional(),
			homeTopicId: z.string().optional(),
			linkTopicId: z.string().optional(),
			linkPosition: z.number().int().nonnegative().optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			const id = newId(args.id);
			await tx.mutate.lesson.insert({
				id,
				title: args.title,
				status: "draft",
				homeProgramId: args.homeProgramId,
				homeTopicId: args.homeTopicId,
			});
			if (args.linkTopicId !== undefined) {
				requireCapability(ctx, "program:write");
				await tx.mutate.topicLesson.insert({
					topicId: args.linkTopicId,
					lessonId: id,
					position: args.linkPosition ?? 0,
				});
			}
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
			const content =
				args.content ??
				(args.type === "practice"
					? {
							testGroupId: "",
							questionCount: 1,
							passPercent: 100,
						}
					: EMPTY_TIPTAP_DOC);
			await tx.mutate.activity.insert({
				id: newId(args.id),
				lessonId: args.lessonId,
				type: args.type,
				position: args.position,
				content,
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

	// ── Test groups (lesson:write) ────────────────────────────────────────

	createTestGroup: defineMutator(
		z.object({
			id: z.string().optional(),
			title: z.string().min(1).max(255),
			description: z.string().max(8000).optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			await tx.mutate.testGroup.insert({
				id: newId(args.id),
				title: args.title,
				description: args.description ?? "",
				status: "draft",
			});
		},
	),

	updateTestGroup: defineMutator(
		z.object({
			id: z.string(),
			title: z.string().min(1).max(255).optional(),
			description: z.string().max(8000).optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			await tx.mutate.testGroup.update({
				id: args.id,
				title: args.title,
				description: args.description,
			});
		},
	),

	publishTestGroup: defineMutator(
		z.object({
			id: z.string(),
			status: publishStatusSchema,
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			await tx.mutate.testGroup.update({
				id: args.id,
				status: args.status,
			});
		},
	),

	createTest: defineMutator(
		z.object({
			id: z.string().optional(),
			groupId: z.string(),
			position: z.number().int().nonnegative(),
			prompt: activityContentSchema.optional(),
			answerType: testAnswerTypeSchema,
			options: z
				.array(z.object({ id: z.string(), label: z.string() }))
				.nullable()
				.optional(),
			correctAnswer: z.json().nullable().optional(),
			grading: testGradingSchema.optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			const id = newId(args.id);
			const grading =
				args.answerType === "file_upload" ? "manual" : (args.grading ?? "auto");
			await tx.mutate.test.insert({
				id,
				groupId: args.groupId,
				position: args.position,
				prompt: args.prompt ?? EMPTY_TIPTAP_DOC,
				answerType: args.answerType,
				options: args.options ?? null,
				grading,
			});
			await tx.mutate.testKey.insert({
				testId: id,
				correctAnswer:
					args.answerType === "file_upload"
						? null
						: ((args.correctAnswer as string | string[] | null | undefined) ??
							null),
			});
		},
	),

	updateTest: defineMutator(
		z.object({
			id: z.string(),
			prompt: activityContentSchema.optional(),
			answerType: testAnswerTypeSchema.optional(),
			options: z
				.array(z.object({ id: z.string(), label: z.string() }))
				.nullable()
				.optional(),
			correctAnswer: z.json().nullable().optional(),
			grading: testGradingSchema.optional(),
			position: z.number().int().nonnegative().optional(),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			const existing = await tx.run(zql.test.where("id", args.id).one());
			if (!existing) {
				throw new Error("Not found");
			}
			const answerType = args.answerType ?? existing.answerType;
			const grading =
				answerType === "file_upload"
					? "manual"
					: (args.grading ?? existing.grading);
			await tx.mutate.test.update({
				id: args.id,
				prompt: args.prompt,
				answerType: args.answerType,
				options: args.options,
				grading,
				position: args.position,
			});
			if (args.correctAnswer !== undefined) {
				await tx.mutate.testKey.upsert({
					testId: args.id,
					correctAnswer:
						answerType === "file_upload"
							? null
							: (args.correctAnswer as string | string[] | null),
				});
			}
		},
	),

	deleteTest: defineMutator(
		z.object({ id: z.string() }),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			await tx.mutate.testKey.delete({ testId: args.id });
			await tx.mutate.test.delete({ id: args.id });
		},
	),

	reorderTests: defineMutator(
		z.object({
			groupId: z.string(),
			orderedIds: z.array(z.string()).min(1),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			for (const [position, id] of args.orderedIds.entries()) {
				const test = await tx.run(zql.test.where("id", id).one());
				if (!test || test.groupId !== args.groupId) {
					throw new Error("Forbidden");
				}
				await tx.mutate.test.update({ id, position });
			}
		},
	),

	configurePracticeActivity: defineMutator(
		z.object({
			activityId: z.string(),
			testGroupId: z.string().min(1),
			questionCount: z.number().int().positive(),
			passPercent: z.number().int().min(0).max(100),
		}),
		async ({ ctx, args, tx }) => {
			requireCapability(ctx, "lesson:write");
			const activity = await tx.run(
				zql.activity.where("id", args.activityId).one(),
			);
			if (!activity || activity.type !== "practice") {
				throw new Error("Not found");
			}
			const group = await tx.run(
				zql.testGroup.where("id", args.testGroupId).one(),
			);
			if (!group) {
				throw new Error("Not found");
			}
			const tests = (await tx.run(
				zql.test.where("groupId", args.testGroupId),
			)) as Array<{ id: string }>;
			if (args.questionCount > tests.length) {
				throw new Error("questionCount exceeds group size");
			}
			const content: PracticeActivityContent = {
				testGroupId: args.testGroupId,
				questionCount: args.questionCount,
				passPercent: args.passPercent,
			};
			await tx.mutate.activity.update({
				id: args.activityId,
				content,
			});
		},
	),

	// ── Test attempts ─────────────────────────────────────────────────────

	/**
	 * Start (or restart) a practice attempt with a random sample of tests.
	 * Client may pass `testIds` (sampled locally); server validates membership.
	 */
	startTestAttempt: defineMutator(
		z.object({
			id: z.string().optional(),
			programId: z.string(),
			activityId: z.string(),
			testIds: z.array(z.string()).min(1).optional(),
		}),
		async ({ ctx, args, tx }) => {
			const user = requireUser(ctx);
			await requireEnrollmentOrPublic(tx as MutatorTx, user.id, args.programId);
			const activity = await requireActivityInProgram(
				tx as MutatorTx,
				args.activityId,
				args.programId,
			);
			if (activity.type !== "practice") {
				throw new Error("Not found");
			}
			const config = parsePracticeContent(activity.content);
			const groupTests = (await tx.run(
				zql.test.where("groupId", config.testGroupId),
			)) as Array<{ id: string }>;
			const allowed = new Set(groupTests.map((t) => t.id));
			if (allowed.size === 0 || config.questionCount > allowed.size) {
				throw new Error("Practice not configured");
			}

			let testIds: string[];
			if (args.testIds && args.testIds.length > 0) {
				if (args.testIds.length !== config.questionCount) {
					throw new Error("Invalid sample size");
				}
				if (args.testIds.some((id) => !allowed.has(id))) {
					throw new Error("Invalid test ids");
				}
				testIds = args.testIds;
			} else {
				testIds = sampleIds([...allowed], config.questionCount);
			}

			const now = Date.now();
			await tx.mutate.testAttempt.insert({
				id: newId(args.id),
				userId: user.id,
				programId: args.programId,
				activityId: args.activityId,
				testIds,
				status: "in_progress",
				scorePercent: null,
				passed: null,
				createdAt: now,
				updatedAt: now,
			});

			await upsertActivityProgress(tx as MutatorTx, {
				userId: user.id,
				programId: args.programId,
				activityId: args.activityId,
				lessonId: activity.lessonId,
				status: "in_progress",
				now,
			});
		},
	),

	submitTestAttempt: defineMutator(
		z.object({
			attemptId: z.string(),
			answers: studentAnswersSchema,
		}),
		async ({ ctx, args, tx }) => {
			const user = requireUser(ctx);
			const attempt = (await tx.run(
				zql.testAttempt.where("id", args.attemptId).one(),
			)) as
				| {
						id: string;
						userId: string;
						programId: string;
						activityId: string;
						testIds: string[];
						status: string;
				  }
				| undefined;
			if (!attempt || attempt.userId !== user.id) {
				throw new Error("Not found");
			}
			if (attempt.status !== "in_progress") {
				throw new Error("Attempt already submitted");
			}

			const activity = await requireActivityInProgram(
				tx as MutatorTx,
				attempt.activityId,
				attempt.programId,
			);
			const config = parsePracticeContent(activity.content);
			const studentAnswers = args.answers as StudentAnswers;
			const testIds = attempt.testIds;

			let graded: ReturnType<typeof gradeAttempt>;
			if (tx.location === "server") {
				const tests = (await tx.run(
					zql.test.where("id", "IN", testIds),
				)) as Array<{
					id: string;
					answerType: string;
					grading: string;
				}>;
				const keys = (await tx.run(
					zql.testKey.where("testId", "IN", testIds),
				)) as Array<{ testId: string; correctAnswer: unknown }>;
				const keyByTest = new Map(keys.map((k) => [k.testId, k.correctAnswer]));
				graded = gradeAttempt(
					tests.map((t) => ({
						id: t.id,
						answerType: t.answerType,
						grading: t.grading,
						correctAnswer: keyByTest.get(t.id) ?? null,
					})),
					studentAnswers,
					config.passPercent,
				);
			} else {
				graded = {
					status: "pending_review",
					answers: markAnswersPending(studentAnswers),
					scorePercent: 0,
					passed: false,
				};
			}

			const now = Date.now();
			for (const testId of testIds) {
				const answer = graded.answers[testId] as GradedAnswer | undefined;
				if (!answer) continue;
				await tx.mutate.testAttemptAnswer.upsert({
					attemptId: attempt.id,
					testId,
					answer,
					result: answer.result,
					reviewedBy: null,
					reviewerComment: null,
					reviewedAt: null,
				});
			}

			await tx.mutate.testAttempt.update({
				id: attempt.id,
				status: graded.status,
				scorePercent: graded.status === "graded" ? graded.scorePercent : null,
				passed: graded.status === "graded" ? graded.passed : null,
				updatedAt: now,
			});

			if (graded.status === "graded" && graded.passed) {
				await upsertActivityProgress(tx as MutatorTx, {
					userId: user.id,
					programId: attempt.programId,
					activityId: attempt.activityId,
					lessonId: activity.lessonId,
					status: "completed",
					now,
				});
			} else {
				await upsertActivityProgress(tx as MutatorTx, {
					userId: user.id,
					programId: attempt.programId,
					activityId: attempt.activityId,
					lessonId: activity.lessonId,
					status: "in_progress",
					now,
				});
			}
		},
	),

	reviewAttempt: defineMutator(
		z.object({
			attemptId: z.string(),
			results: z.record(z.string(), reviewResultSchema).optional(),
			result: reviewResultSchema.optional(),
			testId: z.string().optional(),
			comment: z.string().max(8000).nullable().optional(),
		}),
		async ({ ctx, args, tx }) => {
			const reviewer = requireCapability(ctx, "submission:review");
			const attempt = (await tx.run(
				zql.testAttempt.where("id", args.attemptId).one(),
			)) as
				| {
						id: string;
						userId: string;
						programId: string;
						activityId: string;
						testIds: string[];
						status: string;
				  }
				| undefined;
			if (!attempt) {
				throw new Error("Not found");
			}

			const results: Record<string, "correct" | "incorrect"> = {
				...(args.results ?? {}),
			};
			if (args.testId && args.result) {
				results[args.testId] = args.result;
			}
			if (Object.keys(results).length === 0) {
				throw new Error("Invalid args");
			}

			const answerRows = (await tx.run(
				zql.testAttemptAnswer.where("attemptId", args.attemptId),
			)) as Array<{
				testId: string;
				answer: GradedAnswer;
				reviewerComment: string | null;
			}>;
			const answers: GradedAnswers = {};
			for (const row of answerRows) {
				answers[row.testId] = row.answer;
			}

			const reviewed = applyReviewResults(answers, results);
			const now = Date.now();
			for (const [testId, answer] of Object.entries(reviewed.answers)) {
				const prev = answerRows.find((r) => r.testId === testId);
				await tx.mutate.testAttemptAnswer.update({
					attemptId: args.attemptId,
					testId,
					answer,
					result: answer.result,
					reviewedBy: results[testId] ? reviewer.id : undefined,
					reviewerComment:
						args.comment === undefined ? prev?.reviewerComment : args.comment,
					reviewedAt: results[testId] ? now : undefined,
				});
			}

			const activity = await requireActivityInProgram(
				tx as MutatorTx,
				attempt.activityId,
				attempt.programId,
			);
			const config = parsePracticeContent(activity.content);

			if (reviewed.status === "graded") {
				const score = finalizeAttemptScore(
					reviewed.answers,
					config.passPercent,
				);
				await tx.mutate.testAttempt.update({
					id: args.attemptId,
					status: "graded",
					scorePercent: score.scorePercent,
					passed: score.passed,
					updatedAt: now,
				});
				await upsertActivityProgress(tx as MutatorTx, {
					userId: attempt.userId,
					programId: attempt.programId,
					activityId: attempt.activityId,
					lessonId: activity.lessonId,
					status: score.passed ? "completed" : "in_progress",
					now,
				});
			} else {
				await tx.mutate.testAttempt.update({
					id: args.attemptId,
					status: "pending_review",
					updatedAt: now,
				});
			}
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
			await requireEnrollmentOrPublic(tx as MutatorTx, user.id, args.programId);
			const activity = await requireActivityInProgram(
				tx as MutatorTx,
				args.activityId,
				args.programId,
			);
			await assertStudentCanProgressLesson(
				tx as MutatorTx,
				user,
				args.programId,
				activity.lessonId,
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
			await requireEnrollmentOrPublic(tx as MutatorTx, user.id, args.programId);
			const activity = await requireActivityInProgram(
				tx as MutatorTx,
				args.activityId,
				args.programId,
			);
			await assertStudentCanProgressLesson(
				tx as MutatorTx,
				user,
				args.programId,
				activity.lessonId,
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
