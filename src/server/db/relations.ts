import { defineRelations } from "drizzle-orm";
import { activitiesTable } from "#/server/db/activity/activity.schema";
import { activityProgressTable } from "#/server/db/activity-progress/activity-progress.schema";
import { lessonsTable } from "#/server/db/lesson/lesson.schema";
import { lessonProgressTable } from "#/server/db/lesson-progress/lesson-progress.schema";
import { programsTable } from "#/server/db/program/program.schema";
import { submissionsTable } from "#/server/db/submission/submission.schema";
import { topicsTable } from "#/server/db/topic/topic.schema";
import { topicLessonsTable } from "#/server/db/topic-lesson/topic-lesson.schema";
import { usersTable } from "#/server/db/user/user.schema";

const DrizzleSchema = {
	user: usersTable,
	program: programsTable,
	topic: topicsTable,
	lesson: lessonsTable,
	topicLesson: topicLessonsTable,
	activity: activitiesTable,
	submission: submissionsTable,
	activityProgress: activityProgressTable,
	lessonProgress: lessonProgressTable,
};

export const relations = defineRelations(DrizzleSchema, (r) => ({
	user: {},
	program: {
		topics: r.many.topic(),
		submissions: r.many.submission(),
		activityProgress: r.many.activityProgress(),
		lessonProgress: r.many.lessonProgress(),
	},
	topic: {
		program: r.one.program({
			from: r.topic.programId,
			to: r.program.id,
		}),
		topicLessons: r.many.topicLesson(),
	},
	lesson: {
		topicLessons: r.many.topicLesson(),
		activities: r.many.activity(),
		lessonProgress: r.many.lessonProgress(),
	},
	topicLesson: {
		topic: r.one.topic({
			from: r.topicLesson.topicId,
			to: r.topic.id,
		}),
		lesson: r.one.lesson({
			from: r.topicLesson.lessonId,
			to: r.lesson.id,
		}),
	},
	activity: {
		lesson: r.one.lesson({
			from: r.activity.lessonId,
			to: r.lesson.id,
		}),
		submissions: r.many.submission(),
		activityProgress: r.many.activityProgress(),
	},
	submission: {
		user: r.one.user({
			from: r.submission.userId,
			to: r.user.id,
		}),
		program: r.one.program({
			from: r.submission.programId,
			to: r.program.id,
		}),
		activity: r.one.activity({
			from: r.submission.activityId,
			to: r.activity.id,
		}),
		reviewer: r.one.user({
			from: r.submission.reviewedBy,
			to: r.user.id,
		}),
	},
	activityProgress: {
		user: r.one.user({
			from: r.activityProgress.userId,
			to: r.user.id,
		}),
		program: r.one.program({
			from: r.activityProgress.programId,
			to: r.program.id,
		}),
		activity: r.one.activity({
			from: r.activityProgress.activityId,
			to: r.activity.id,
		}),
	},
	lessonProgress: {
		user: r.one.user({
			from: r.lessonProgress.userId,
			to: r.user.id,
		}),
		program: r.one.program({
			from: r.lessonProgress.programId,
			to: r.program.id,
		}),
		lesson: r.one.lesson({
			from: r.lessonProgress.lessonId,
			to: r.lesson.id,
		}),
	},
}));
