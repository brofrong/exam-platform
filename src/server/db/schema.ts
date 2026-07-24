import { activitiesTable } from "./activity/activity.schema";
import { activityProgressTable } from "./activity-progress/activity-progress.schema";
import { lessonsTable } from "./lesson/lesson.schema";
import { lessonProgressTable } from "./lesson-progress/lesson-progress.schema";
import { programsTable } from "./program/program.schema";
import { submissionsTable } from "./submission/submission.schema";
import { topicsTable } from "./topic/topic.schema";
import { topicLessonsTable } from "./topic-lesson/topic-lesson.schema";
import { usersTable } from "./user/user.schema";

export { activitiesTable as activity } from "./activity/activity.schema";
export { activityProgressTable as activityProgress } from "./activity-progress/activity-progress.schema";
export { lessonsTable as lesson } from "./lesson/lesson.schema";
export { lessonProgressTable as lessonProgress } from "./lesson-progress/lesson-progress.schema";
export { programsTable as program } from "./program/program.schema";
export { relations } from "./relations";
export { submissionsTable as submission } from "./submission/submission.schema";
export { topicsTable as topic } from "./topic/topic.schema";
export { topicLessonsTable as topicLesson } from "./topic-lesson/topic-lesson.schema";
export { usersTable as user } from "./user/user.schema";

/** App tables for Zero / drizzle-zero. Auth tables are wired only in betterAuth. */
export const DrizzleSchema = {
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
