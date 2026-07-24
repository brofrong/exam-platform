/** Common exam types for the program form. */
export const EXAM_TYPES = ["ЕГЭ", "ОГЭ"] as const;

export type ExamTypeOption = (typeof EXAM_TYPES)[number];

/** Suggested subjects — free text still allowed in the form. */
export const SUBJECT_SUGGESTIONS = [
	"Математика",
	"Русский язык",
	"Физика",
	"Информатика",
	"Обществознание",
	"История",
	"Химия",
	"Биология",
	"Английский язык",
] as const;
