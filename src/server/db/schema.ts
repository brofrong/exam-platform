import { activitiesTable } from "./activity/activity.schema";
import { activityProgressTable } from "./activity-progress/activity-progress.schema";
import { enrollmentsTable } from "./enrollment/enrollment.schema";
import { lessonsTable } from "./lesson/lesson.schema";
import { lessonProgressTable } from "./lesson-progress/lesson-progress.schema";
import { lessonLockEdgesTable } from "./lesson-lock-edge/lesson-lock-edge.schema";
import { programsTable } from "./program/program.schema";
import { programInvitesTable } from "./program-invite/program-invite.schema";
import { programInviteProgramsTable } from "./program-invite/program-invite-program.schema";
import { supportMessagesTable } from "./support-message/support-message.schema";
import { supportThreadsTable } from "./support-thread/support-thread.schema";
import { testsTable } from "./test/test.schema";
import { testAttemptsTable } from "./test-attempt/test-attempt.schema";
import { testAttemptAnswersTable } from "./test-attempt-answer/test-attempt-answer.schema";
import { testGroupsTable } from "./test-group/test-group.schema";
import { testKeysTable } from "./test-key/test-key.schema";
import { topicsTable } from "./topic/topic.schema";
import { topicLessonsTable } from "./topic-lesson/topic-lesson.schema";
import { topicLockEdgesTable } from "./topic-lock-edge/topic-lock-edge.schema";
import { usersTable } from "./user/user.schema";

export { activitiesTable as activity } from "./activity/activity.schema";
export { activityProgressTable as activityProgress } from "./activity-progress/activity-progress.schema";
export { enrollmentsTable as enrollment } from "./enrollment/enrollment.schema";
export { lessonsTable as lesson } from "./lesson/lesson.schema";
export { lessonProgressTable as lessonProgress } from "./lesson-progress/lesson-progress.schema";
export { lessonLockEdgesTable as lessonLockEdge } from "./lesson-lock-edge/lesson-lock-edge.schema";
export { programsTable as program } from "./program/program.schema";
export { programInvitesTable as programInvite } from "./program-invite/program-invite.schema";
export { programInviteProgramsTable as programInviteProgram } from "./program-invite/program-invite-program.schema";
export { relations } from "./relations";
export { supportMessagesTable as supportMessage } from "./support-message/support-message.schema";
export { supportThreadsTable as supportThread } from "./support-thread/support-thread.schema";
export { testsTable as test } from "./test/test.schema";
export { testAttemptsTable as testAttempt } from "./test-attempt/test-attempt.schema";
export { testAttemptAnswersTable as testAttemptAnswer } from "./test-attempt-answer/test-attempt-answer.schema";
export { testGroupsTable as testGroup } from "./test-group/test-group.schema";
export { testKeysTable as testKey } from "./test-key/test-key.schema";
export { topicsTable as topic } from "./topic/topic.schema";
export { topicLessonsTable as topicLesson } from "./topic-lesson/topic-lesson.schema";
export { topicLockEdgesTable as topicLockEdge } from "./topic-lock-edge/topic-lock-edge.schema";
export { usersTable as user } from "./user/user.schema";

/** App tables for Zero / drizzle-zero. Auth tables are wired only in betterAuth. */
export const DrizzleSchema = {
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
