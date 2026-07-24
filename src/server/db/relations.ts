import { defineRelations } from "drizzle-orm";
import { activitiesTable } from "#/server/db/activity/activity.schema";
import { lessonsTable } from "#/server/db/lesson/lesson.schema";
import { programsTable } from "#/server/db/program/program.schema";
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
};

export const relations = defineRelations(DrizzleSchema, (r) => ({
	user: {},
	program: {
		topics: r.many.topic(),
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
	},
}));
