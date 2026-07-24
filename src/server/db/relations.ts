import { defineRelations } from "drizzle-orm";
import { activitiesTable } from "#/server/db/activity/activity.schema";
import { activityProgressTable } from "#/server/db/activity-progress/activity-progress.schema";
import { enrollmentsTable } from "#/server/db/enrollment/enrollment.schema";
import { lessonsTable } from "#/server/db/lesson/lesson.schema";
import { lessonProgressTable } from "#/server/db/lesson-progress/lesson-progress.schema";
import { programsTable } from "#/server/db/program/program.schema";
import { programInvitesTable } from "#/server/db/program-invite/program-invite.schema";
import { programInviteProgramsTable } from "#/server/db/program-invite/program-invite-program.schema";
import { submissionsTable } from "#/server/db/submission/submission.schema";
import { supportMessagesTable } from "#/server/db/support-message/support-message.schema";
import { supportThreadsTable } from "#/server/db/support-thread/support-thread.schema";
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
	programInvite: programInvitesTable,
	programInviteProgram: programInviteProgramsTable,
	enrollment: enrollmentsTable,
	supportThread: supportThreadsTable,
	supportMessage: supportMessagesTable,
};

export const relations = defineRelations(DrizzleSchema, (r) => ({
	user: {
		enrollments: r.many.enrollment(),
		supportThreads: r.many.supportThread(),
		supportMessages: r.many.supportMessage(),
	},
	program: {
		topics: r.many.topic(),
		submissions: r.many.submission(),
		activityProgress: r.many.activityProgress(),
		lessonProgress: r.many.lessonProgress(),
		enrollments: r.many.enrollment(),
		invitePrograms: r.many.programInviteProgram(),
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
	programInvite: {
		createdBy: r.one.user({
			from: r.programInvite.createdByUserId,
			to: r.user.id,
		}),
		usedBy: r.one.user({
			from: r.programInvite.usedByUserId,
			to: r.user.id,
		}),
		programs: r.many.programInviteProgram(),
	},
	programInviteProgram: {
		invite: r.one.programInvite({
			from: r.programInviteProgram.inviteId,
			to: r.programInvite.id,
		}),
		program: r.one.program({
			from: r.programInviteProgram.programId,
			to: r.program.id,
		}),
	},
	enrollment: {
		user: r.one.user({
			from: r.enrollment.userId,
			to: r.user.id,
		}),
		program: r.one.program({
			from: r.enrollment.programId,
			to: r.program.id,
		}),
	},
	supportThread: {
		student: r.one.user({
			from: r.supportThread.studentUserId,
			to: r.user.id,
		}),
		messages: r.many.supportMessage(),
	},
	supportMessage: {
		thread: r.one.supportThread({
			from: r.supportMessage.threadId,
			to: r.supportThread.id,
		}),
		author: r.one.user({
			from: r.supportMessage.authorId,
			to: r.user.id,
		}),
	},
}));
