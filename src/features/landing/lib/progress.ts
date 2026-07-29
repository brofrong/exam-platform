/**
 * Shared «student progress» content for landing variants.
 * Reflects the real platform model: program → topics → lessons with percent,
 * regular probnik score checkpoints mapped to ЕГЭ/ОГЭ outcomes.
 */

export type ScoreCheckpoint = {
	readonly label: string;
	readonly detail: string;
	readonly score: number;
};

/** Typical score trajectory on ЕГЭ профиль (100-балльная шкала) */
export const PROGRESS_SCORE_PATH: readonly ScoreCheckpoint[] = [
	{ label: "Старт", detail: "диагностика", score: 34 },
	{ label: "Месяц 1", detail: "база первой части", score: 45 },
	{ label: "Месяц 2", detail: "типовые задачи", score: 56 },
	{ label: "Месяц 3", detail: "вторая часть", score: 67 },
	{ label: "Месяц 4", detail: "пробники", score: 76 },
	{ label: "ЕГЭ", detail: "цель", score: 85 },
] as const;

export type TopicProgress = {
	readonly title: string;
	/** Какие задания экзамена закрывает тема */
	readonly exam: string;
	/** Процент освоения — как в аналитике платформы */
	readonly percent: number;
	/** Вклад темы в итоговый балл */
	readonly points: string;
};

export const PROGRESS_TOPICS: readonly TopicProgress[] = [
	{
		title: "Алгебра и быстрый счёт",
		exam: "ЕГЭ №1–5 · ОГЭ №1–9",
		percent: 100,
		points: "+12 баллов",
	},
	{
		title: "Уравнения и неравенства",
		exam: "ЕГЭ №5, 12, 15",
		percent: 82,
		points: "+9 баллов",
	},
	{
		title: "Тригонометрия",
		exam: "ЕГЭ №12, 13",
		percent: 64,
		points: "+7 баллов",
	},
	{
		title: "Производная и графики",
		exam: "ЕГЭ №7, 11 · ОГЭ №11",
		percent: 45,
		points: "+6 баллов",
	},
	{
		title: "Стереометрия",
		exam: "ЕГЭ №3, 14",
		percent: 28,
		points: "+5 баллов",
	},
] as const;

export type ProgressImpact = {
	readonly title: string;
	readonly text: string;
};

/** Как видимый прогресс превращается в балл ЕГЭ/ОГЭ */
export const PROGRESS_IMPACT: readonly ProgressImpact[] = [
	{
		title: "Каждая тема — это задания экзамена",
		text: "Закрыл тему на платформе — стабильно решаешь её задания. Первая часть даёт ~60 баллов, вторая — 80+.",
	},
	{
		title: "Замер каждые 4 недели",
		text: "Пробник показывает рост в баллах, а не «вроде стало понятнее». По цифрам корректируем план.",
	},
	{
		title: "Прогресс виден в кабинете",
		text: "Процент по каждой теме, статусы уроков и история пробников — видят и ученик, и родители.",
	},
] as const;

export type WeekStep = {
	readonly day: string;
	readonly title: string;
	readonly text: string;
};

/** Ритм недели ученика на платформе */
export const PROGRESS_WEEK: readonly WeekStep[] = [
	{ day: "Пн", title: "Урок в Zoom", text: "новая тема и разбор задач" },
	{ day: "Ср", title: "Домашка", text: "автопроверка на платформе" },
	{ day: "Пт", title: "Повторение", text: "тренажёр слабых мест" },
	{ day: "Вс", title: "Пробник", text: "раз в 4 недели — замер балла" },
] as const;

/** Итог для ученика на разных экзаменах */
export const PROGRESS_OUTCOME = {
	ege: "на ЕГЭ это путь 34 → 85 баллов",
	oge: "на ОГЭ — уверенная «3» → «5»",
	note: "при регулярных занятиях и выполнении домашки",
} as const;
