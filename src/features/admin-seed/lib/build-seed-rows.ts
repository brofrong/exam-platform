import {
	activityId,
	DEMO_CATALOG,
	lessonId,
	topicId,
} from "#/features/admin-seed/lib/catalog";
import {
	practiceContentFor,
	theoryContentFor,
} from "#/features/admin-seed/lib/lesson-content";
import type { ActivityContent } from "#/server/db/activity/activity.schema";

export type SeedRows = {
	programs: Array<{
		id: string;
		title: string;
		description: string;
		examType: string;
		subject: string;
		status: "published";
		public: boolean;
	}>;
	topics: Array<{
		id: string;
		programId: string;
		title: string;
		position: number;
		status: "published";
	}>;
	lessons: Array<{
		id: string;
		title: string;
		status: "published";
		homeProgramId: string;
		homeTopicId: string;
	}>;
	topicLessons: Array<{
		topicId: string;
		lessonId: string;
		position: number;
	}>;
	activities: Array<{
		id: string;
		lessonId: string;
		type: "theory" | "practice";
		position: number;
		content: ActivityContent;
	}>;
};

/** Expand static catalog into DB rows (all published). */
export function buildSeedRows(): SeedRows {
	const programs: SeedRows["programs"] = [];
	const topics: SeedRows["topics"] = [];
	const lessons: SeedRows["lessons"] = [];
	const topicLessons: SeedRows["topicLessons"] = [];
	const activities: SeedRows["activities"] = [];

	for (const program of DEMO_CATALOG) {
		programs.push({
			id: program.id,
			title: program.title,
			description: program.description,
			examType: program.examType,
			subject: program.subject,
			status: "published",
			public: true,
		});

		program.topics.forEach((topic, topicIndex) => {
			const tId = topicId(program.id, topicIndex);
			topics.push({
				id: tId,
				programId: program.id,
				title: topic.title,
				position: topicIndex,
				status: "published",
			});

			topic.lessons.forEach((lesson, lessonIndex) => {
				const lId = lessonId(program.id, topicIndex, lessonIndex);
				lessons.push({
					id: lId,
					title: lesson.title,
					status: "published",
					homeProgramId: program.id,
					homeTopicId: tId,
				});
				topicLessons.push({
					topicId: tId,
					lessonId: lId,
					position: lessonIndex,
				});

				activities.push({
					id: activityId(lId, "theory"),
					lessonId: lId,
					type: "theory",
					position: 0,
					content: theoryContentFor(
						program,
						topic.title,
						lesson,
					) as ActivityContent,
				});
				activities.push({
					id: activityId(lId, "practice"),
					lessonId: lId,
					type: "practice",
					position: 1,
					content: practiceContentFor(program, lId, lesson) as ActivityContent,
				});
			});
		});
	}

	return { programs, topics, lessons, topicLessons, activities };
}

export function summarizeSeedRows(rows: SeedRows) {
	return {
		programs: rows.programs.length,
		topics: rows.topics.length,
		lessons: rows.lessons.length,
		activities: rows.activities.length,
	};
}
