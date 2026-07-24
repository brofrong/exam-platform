export type OutlineLesson = {
	readonly id: string;
	readonly title: string;
	readonly activities?: ReadonlyArray<{
		readonly id: string;
		readonly position: number;
	}> | null;
};

export type OutlineTopic = {
	readonly position: number;
	readonly topicLessons?: ReadonlyArray<{
		readonly position: number;
		readonly lesson?: OutlineLesson | null;
	}> | null;
};

export type OutlineProgram = {
	readonly id: string;
	readonly title: string;
	readonly description?: string | null;
	readonly subject?: string | null;
	readonly examType?: string | null;
	readonly topics?: ReadonlyArray<OutlineTopic> | null;
};

export type LessonProgressRow = {
	readonly programId: string;
	readonly lessonId: string;
	readonly status: string;
	readonly percent: number;
};

export type ActivityProgressRow = {
	readonly programId: string;
	readonly activityId: string;
	readonly status: string;
	readonly completedAt?: number | null;
	readonly activity?: {
		readonly id: string;
		readonly lessonId: string;
		readonly position: number;
	} | null;
};

export type ContinueTarget = {
	programId: string;
	programTitle: string;
	lessonId: string;
	lessonTitle: string;
	activityId?: string;
	progress?: number;
};

export function flattenProgramLessons(
	program: OutlineProgram,
): OutlineLesson[] {
	const topics = [...(program.topics ?? [])].sort(
		(a, b) => a.position - b.position,
	);
	const lessons: OutlineLesson[] = [];
	for (const topic of topics) {
		const links = [...(topic.topicLessons ?? [])].sort(
			(a, b) => a.position - b.position,
		);
		for (const link of links) {
			if (link.lesson) {
				lessons.push(link.lesson);
			}
		}
	}
	return lessons;
}

export function programProgressPercent(
	program: OutlineProgram,
	lessonProgress: readonly LessonProgressRow[],
): number {
	const lessons = flattenProgramLessons(program);
	if (lessons.length === 0) {
		return 0;
	}
	const byLesson = new Map(
		lessonProgress
			.filter((row) => row.programId === program.id)
			.map((row) => [row.lessonId, row.percent] as const),
	);
	const sum = lessons.reduce(
		(acc, lesson) => acc + (byLesson.get(lesson.id) ?? 0),
		0,
	);
	return Math.round(sum / lessons.length);
}

export function averageEnrolledProgress(
	programs: readonly OutlineProgram[],
	lessonProgress: readonly LessonProgressRow[],
): number {
	if (programs.length === 0) {
		return 0;
	}
	const sum = programs.reduce(
		(acc, program) => acc + programProgressPercent(program, lessonProgress),
		0,
	);
	return Math.round(sum / programs.length);
}

export function countCompletedLessons(
	lessonProgress: readonly LessonProgressRow[],
): number {
	return lessonProgress.filter((row) => row.status === "completed").length;
}

export function formatLastActivity(
	activityProgress: readonly ActivityProgressRow[],
): string {
	const withTime = activityProgress
		.filter((row) => row.completedAt != null)
		.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
	if (withTime.length === 0) {
		if (activityProgress.some((row) => row.status === "in_progress")) {
			return "В процессе";
		}
		return "Нет данных";
	}
	return new Date(withTime[0].completedAt as number).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function findContinueTarget(
	programs: readonly OutlineProgram[],
	lessonProgress: readonly LessonProgressRow[],
	activityProgress: readonly ActivityProgressRow[],
): ContinueTarget | null {
	if (programs.length === 0) {
		return null;
	}

	const lessonById = new Map<
		string,
		{ program: OutlineProgram; lesson: OutlineLesson }
	>();
	for (const program of programs) {
		for (const lesson of flattenProgramLessons(program)) {
			lessonById.set(`${program.id}:${lesson.id}`, { program, lesson });
		}
	}

	const progressByLesson = new Map<string, LessonProgressRow>();
	for (const row of lessonProgress) {
		progressByLesson.set(`${row.programId}:${row.lessonId}`, row);
	}

	const incompleteActivities = [...activityProgress]
		.filter((row) => row.status !== "completed" && row.activity != null)
		.sort((a, b) => {
			if (a.status === "in_progress" && b.status !== "in_progress") {
				return -1;
			}
			if (b.status === "in_progress" && a.status !== "in_progress") {
				return 1;
			}
			return (b.completedAt ?? 0) - (a.completedAt ?? 0);
		});

	for (const row of incompleteActivities) {
		const activity = row.activity;
		if (!activity) {
			continue;
		}
		const key = `${row.programId}:${activity.lessonId}`;
		const match = lessonById.get(key);
		if (!match) {
			continue;
		}
		const lessonRow = progressByLesson.get(key);
		return {
			programId: match.program.id,
			programTitle: match.program.title,
			lessonId: match.lesson.id,
			lessonTitle: match.lesson.title,
			activityId: activity.id,
			progress: lessonRow?.percent,
		};
	}

	for (const program of programs) {
		for (const lesson of flattenProgramLessons(program)) {
			const key = `${program.id}:${lesson.id}`;
			const row = progressByLesson.get(key);
			if (!row || row.status !== "completed") {
				return {
					programId: program.id,
					programTitle: program.title,
					lessonId: lesson.id,
					lessonTitle: lesson.title,
					progress: row?.percent ?? 0,
				};
			}
		}
	}

	const first = programs[0];
	const firstLesson = flattenProgramLessons(first)[0];
	if (!firstLesson) {
		return null;
	}
	return {
		programId: first.id,
		programTitle: first.title,
		lessonId: firstLesson.id,
		lessonTitle: firstLesson.title,
		progress: 100,
	};
}
