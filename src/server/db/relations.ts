import { defineRelations } from "drizzle-orm";
import { activitiesTable } from "#/server/db/activity/activity.schema";
import { activityProgressTable } from "#/server/db/activity-progress/activity-progress.schema";
import { enrollmentsTable } from "#/server/db/enrollment/enrollment.schema";
import { lessonsTable } from "#/server/db/lesson/lesson.schema";
import { lessonProgressTable } from "#/server/db/lesson-progress/lesson-progress.schema";
import { lessonLockEdgesTable } from "#/server/db/lesson-lock-edge/lesson-lock-edge.schema";
import { programsTable } from "#/server/db/program/program.schema";
import { programInvitesTable } from "#/server/db/program-invite/program-invite.schema";
import { programInviteProgramsTable } from "#/server/db/program-invite/program-invite-program.schema";
import { supportMessagesTable } from "#/server/db/support-message/support-message.schema";
import { supportThreadsTable } from "#/server/db/support-thread/support-thread.schema";
import { testsTable } from "#/server/db/test/test.schema";
import { testAttemptsTable } from "#/server/db/test-attempt/test-attempt.schema";
import { testAttemptAnswersTable } from "#/server/db/test-attempt-answer/test-attempt-answer.schema";
import { testGroupsTable } from "#/server/db/test-group/test-group.schema";
import { testKeysTable } from "#/server/db/test-key/test-key.schema";
import { topicsTable } from "#/server/db/topic/topic.schema";
import { topicLessonsTable } from "#/server/db/topic-lesson/topic-lesson.schema";
import { topicLockEdgesTable } from "#/server/db/topic-lock-edge/topic-lock-edge.schema";
import { usersTable } from "#/server/db/user/user.schema";

const DrizzleSchema = {
	user: usersTable,
	program: programsTable,
	topic: topicsTable,
	lesson: lessonsTable,
	topicLesson: topicLessonsTable,
	topicLockEdge: topicLockEdgesTable,
	lessonLockEdge: lessonLockEdgesTable,
	activity: activitiesTable,
	testGroup: testGroupsTable,
	test: testsTable,
	testKey: testKeysTable,
	testAttempt: testAttemptsTable,
	testAttemptAnswer: testAttemptAnswersTable,
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
		testAttempts: r.many.testAttempt(),
	},
	program: {
		topics: r.many.topic(),
		testAttempts: r.many.testAttempt(),
		activityProgress: r.many.activityProgress(),
		lessonProgress: r.many.lessonProgress(),
		enrollments: r.many.enrollment(),
		invitePrograms: r.many.programInviteProgram(),
		topicLockEdges: r.many.topicLockEdge(),
		lessonLockEdges: r.many.lessonLockEdge(),
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
		homeProgram: r.one.program({
			from: r.lesson.homeProgramId,
			to: r.program.id,
		}),
		homeTopic: r.one.topic({
			from: r.lesson.homeTopicId,
			to: r.topic.id,
		}),
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
	topicLockEdge: {
		program: r.one.program({
			from: r.topicLockEdge.programId,
			to: r.program.id,
		}),
		blockerTopic: r.one.topic({
			from: r.topicLockEdge.blockerTopicId,
			to: r.topic.id,
		}),
		topic: r.one.topic({
			from: r.topicLockEdge.topicId,
			to: r.topic.id,
		}),
	},
	lessonLockEdge: {
		program: r.one.program({
			from: r.lessonLockEdge.programId,
			to: r.program.id,
		}),
		topic: r.one.topic({
			from: r.lessonLockEdge.topicId,
			to: r.topic.id,
		}),
		blockerLesson: r.one.lesson({
			from: r.lessonLockEdge.blockerLessonId,
			to: r.lesson.id,
		}),
		lesson: r.one.lesson({
			from: r.lessonLockEdge.lessonId,
			to: r.lesson.id,
		}),
	},
	activity: {
		lesson: r.one.lesson({
			from: r.activity.lessonId,
			to: r.lesson.id,
		}),
		testAttempts: r.many.testAttempt(),
		activityProgress: r.many.activityProgress(),
	},
	testGroup: {
		tests: r.many.test(),
	},
	test: {
		group: r.one.testGroup({
			from: r.test.groupId,
			to: r.testGroup.id,
		}),
		key: r.one.testKey({
			from: r.test.id,
			to: r.testKey.testId,
		}),
		attemptAnswers: r.many.testAttemptAnswer(),
	},
	testKey: {
		test: r.one.test({
			from: r.testKey.testId,
			to: r.test.id,
		}),
	},
	testAttempt: {
		user: r.one.user({
			from: r.testAttempt.userId,
			to: r.user.id,
		}),
		program: r.one.program({
			from: r.testAttempt.programId,
			to: r.program.id,
		}),
		activity: r.one.activity({
			from: r.testAttempt.activityId,
			to: r.activity.id,
		}),
		answers: r.many.testAttemptAnswer(),
	},
	testAttemptAnswer: {
		attempt: r.one.testAttempt({
			from: r.testAttemptAnswer.attemptId,
			to: r.testAttempt.id,
		}),
		test: r.one.test({
			from: r.testAttemptAnswer.testId,
			to: r.test.id,
		}),
		reviewer: r.one.user({
			from: r.testAttemptAnswer.reviewedBy,
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
