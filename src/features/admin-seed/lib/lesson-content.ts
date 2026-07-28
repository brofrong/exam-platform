import type { JSONContent } from "@tiptap/core";
import type {
	SeedLessonDef,
	SeedProgramDef,
} from "#/features/admin-seed/lib/catalog";
import {
	buildPracticeDoc,
	buildTheoryDoc,
	type PracticeBrief,
} from "#/features/admin-seed/lib/content-builders";
import type { PlotKind } from "#/features/admin-seed/lib/mafs-plots";

function keyPointsFor(
	subject: SeedProgramDef["subject"],
	plot: PlotKind,
	lessonTitle: string,
): string[] {
	if (subject === "Математика") {
		return [
			`В центре урока «${lessonTitle}» — точные определения и условия применимости формул.`,
			"Связывайте алгебраическую запись с геометрией графика: нули, экстремумы, асимптоты.",
			"В КИМ часто проверяют ОДЗ, знаки и аккуратность преобразований — фиксируйте их письменно.",
			plotHint(plot),
		];
	}
	return [
		`В уроке «${lessonTitle}» держите в голове физический смысл величин и единицы СИ.`,
		"Перед формулой сформулируйте модель: что сохраняется, что пренебрегаем, какие силы/поля действуют.",
		"Проверяйте размерность и порядок величины — это ловит половину вычислительных ошибок.",
		plotHint(plot),
	];
}

function plotHint(plot: PlotKind): string {
	switch (plot) {
		case "linear":
			return "На линейном графике угловой коэффициент — скорость изменения величины.";
		case "quadratic":
			return "Парабола: направление ветвей задаёт знак старшего коэффициента, вершина — экстремум.";
		case "sine":
			return "Синусоида: амплитуда, период и сдвиг фазы читаются прямо с рисунка.";
		case "absolute":
			return "График модуля «отражает» отрицательную часть — удобно для уравнений с |x|.";
		case "exponential":
			return "Показательная кривая растёт (или убывает) быстрее степенной — сравнивайте основания.";
		case "hyperbola":
			return "Гипербола имеет асимптоты: следите за точками, где выражение не определено.";
		case "cubic":
			return "Кубическая кривая может иметь перегиб — это важно для исследования функции.";
		case "circle":
			return "Окружность и периодические процессы удобно читать в полярной/параметрической форме.";
		case "vectors":
			return "Векторы складываются геометрически: рисуйте полигон сил или перемещений.";
		case "xt-motion":
			return "На графике x(t) наклон — скорость; сравнивайте кривые равномерного и ускоренного движения.";
		case "vt-motion":
			return "На графике v(t) наклон — ускорение, площадь — перемещение.";
		case "projectile":
			return "Траектория броска — парабола; отдельно анализируйте проекции на оси.";
		case "iv-ohm":
			return "Прямая I(U) через начало координат — омический участок; наклон связан с 1/R.";
		case "wave":
			return "Сдвиг фазы между волнами виден как горизонтальный сдвиг графиков.";
		case "hooke":
			return "Закон Гука линеен на упругом участке: F ∝ x до предела пропорциональности.";
		case "power":
			return "Квадратичные зависимости (энергия, мощность) растут быстрее линейных — это видно на графике.";
		default: {
			const _exhaustive: never = plot;
			return _exhaustive;
		}
	}
}

function exampleFor(
	subject: SeedProgramDef["subject"],
	lesson: SeedLessonDef,
): string {
	if (subject === "Математика") {
		return `Пример. Разберите задание на тему «${lesson.title}»: выпишите дано, зафиксируйте ОДЗ (если есть), выполните равносильные преобразования и сделайте проверку подстановкой. ${lesson.focus} Сверьте ответ с графиком: совпадают ли особые точки с алгебраическим решением.`;
	}
	return `Пример. Условие на тему «${lesson.title}»: переведите величины в СИ, запишите исходные уравнения модели, выразите неизвестное и оцените порядок ответа. ${lesson.focus} Сопоставьте результат с формой зависимости на интерактивном графике.`;
}

function practiceQuestions(
	program: SeedProgramDef,
	lesson: SeedLessonDef,
): PracticeBrief["questions"] {
	const { subject, examType } = program;
	const title = lesson.title;

	if (subject === "Математика") {
		return [
			{
				kind: "single",
				prompt: `Что в первую очередь проверить в задании по теме «${title}» (${examType})?`,
				options: [
					"ОДЗ / область допустимых значений и ограничения",
					"Только конечный численный ответ без проверки",
					"Случайный перебор вариантов без модели",
					"Игнорирование знака при умножении неравенства",
				],
				correctIndex: 0,
			},
			{
				kind: "short",
				prompt:
					"Чему равен дискриминант уравнения x² − 5x + 6 = 0? Введите целое число.",
				answer: "1",
			},
			{
				kind: "short",
				prompt:
					"Угловой коэффициент прямой y = −2x + 3 равен… Введите число (можно отрицательное).",
				answer: "-2",
			},
			{
				kind: "multi",
				prompt: `Отметьте верные утверждения для подготовки к «${title}»:`,
				options: [
					"График помогает контролировать алгебраическое решение",
					"Проверка подстановкой снижает риск арифметической ошибки",
					"В неравенствах знак можно всегда оставлять без изменений",
					"ОДЗ достаточно указать только в уме, не записывая",
				],
				correctIndexes: [0, 1],
			},
			{
				kind: "single",
				prompt: "Вершина параболы y = x² − 4x + 1 имеет абсциссу…",
				options: ["2", "−2", "4", "1"],
				correctIndex: 0,
			},
		];
	}

	return [
		{
			kind: "single",
			prompt: `В задачах по теме «${title}» (${examType}) единицы измерения нужно…`,
			options: [
				"Привести к СИ до подстановки в формулы",
				"Оставить как в условии без перевода",
				"Смешивать см и м в одной формуле",
				"Игнорировать размерность ответа",
			],
			correctIndex: 0,
		},
		{
			kind: "short",
			prompt:
				"Свободное падение: модуль ускорения g в оценках школьных задач часто принимают равным… (целое число, м/с²).",
			answer: "10",
		},
		{
			kind: "short",
			prompt:
				"Закон Ома для участка цепи: I = U/R. Если U = 12 В, R = 4 Ом, то I = … А. Введите число.",
			answer: "3",
		},
		{
			kind: "multi",
			prompt: `Что полезно сделать при разборе «${title}»?`,
			options: [
				"Сделать схематический рисунок / график",
				"Проверить размерность ответа",
				"Подставить числа до записи уравнений модели",
				"Сформулировать, что сохраняется в процессе",
			],
			correctIndexes: [0, 1, 3],
		},
		{
			kind: "single",
			prompt: "На графике v(t) площадь под кривой численно равна…",
			options: ["Перемещению (в проекции)", "Ускорению", "Силе", "Мощности"],
			correctIndex: 0,
		},
	];
}

export function theoryContentFor(
	program: SeedProgramDef,
	topicTitle: string,
	lesson: SeedLessonDef,
): JSONContent {
	return buildTheoryDoc({
		lessonTitle: lesson.title,
		topicTitle,
		subject: program.subject,
		examType: program.examType,
		focus: lesson.focus,
		plot: lesson.plot,
		keyPoints: keyPointsFor(program.subject, lesson.plot, lesson.title),
		example: exampleFor(program.subject, lesson),
	});
}

export function practiceContentFor(
	program: SeedProgramDef,
	lessonKey: string,
	lesson: SeedLessonDef,
): JSONContent {
	return buildPracticeDoc({
		lessonId: lessonKey,
		lessonTitle: lesson.title,
		questions: practiceQuestions(program, lesson),
	});
}
