import { useZero } from "@rocicorp/zero/react";
import { useState } from "react";
import { LessonLockGraphEditor } from "#/features/program-locks/ui/lesson-lock-graph-editor";
import { TopicLockGraphEditor } from "#/features/program-locks/ui/topic-lock-graph-editor";
import { LOCK_MODES, type LockMode } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const MODE_LABELS: Record<LockMode, string> = {
	open: "Открыто полностью",
	sequential: "По порядку сверху вниз",
	graph: "Граф зависимостей",
};

type TopicRef = {
	id: string;
	title: string;
	position: number;
	topicLessons?: ReadonlyArray<{
		lessonId: string;
		position: number;
		lesson?: { id: string; title: string } | null;
	}>;
};

type ProgramLockSettingsProps = {
	program: {
		id: string;
		topicLockMode?: string | null;
		lessonLockMode?: string | null;
		unlockThresholdPercent?: number | null;
		topics?: ReadonlyArray<TopicRef> | null;
		topicLockEdges?: ReadonlyArray<{
			id: string;
			blockerTopicId: string;
			topicId: string;
		}> | null;
		lessonLockEdges?: ReadonlyArray<{
			id: string;
			topicId: string;
			blockerLessonId: string;
			lessonId: string;
		}> | null;
	};
};

function asLockMode(value: string | null | undefined): LockMode {
	if (value && (LOCK_MODES as readonly string[]).includes(value)) {
		return value as LockMode;
	}
	return "open";
}

export function ProgramLockSettings({ program }: ProgramLockSettingsProps) {
	const zero = useZero();
	const topicMode = asLockMode(program.topicLockMode);
	const lessonMode = asLockMode(program.lessonLockMode);
	const threshold = program.unlockThresholdPercent ?? 80;
	const [topicGraphOpen, setTopicGraphOpen] = useState(false);
	const [lessonGraphTopicId, setLessonGraphTopicId] = useState<string | null>(
		null,
	);

	const topics = [...(program.topics ?? [])].sort(
		(a, b) => a.position - b.position,
	);

	const updateSettings = async (patch: {
		topicLockMode?: LockMode;
		lessonLockMode?: LockMode;
		unlockThresholdPercent?: number;
	}) => {
		await zero.mutate(
			mutators.updateProgramLockSettings({
				id: program.id,
				...patch,
			}),
		);
	};

	const lessonGraphTopic =
		topics.find((topic) => topic.id === lessonGraphTopicId) ?? null;

	return (
		<section
			className="flex flex-col gap-4 rounded-xl border bg-card px-4 py-4"
			data-testid="program-lock-settings"
		>
			<div>
				<h2 className="text-base font-medium">Доступ к занятиям</h2>
				<p className="text-sm text-muted-foreground">
					Как открываются темы и уроки для студентов. Порог один на программу.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor={`topic-lock-mode-${program.id}`}>Режим тем</Label>
					<Select
						value={topicMode}
						onValueChange={(value) => {
							if (!value) return;
							void updateSettings({ topicLockMode: value as LockMode });
						}}
					>
						<SelectTrigger
							id={`topic-lock-mode-${program.id}`}
							className="w-full"
							data-testid="program-topic-lock-mode"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LOCK_MODES.map((mode) => (
								<SelectItem key={mode} value={mode}>
									{MODE_LABELS[mode]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor={`lesson-lock-mode-${program.id}`}>Режим уроков</Label>
					<Select
						value={lessonMode}
						onValueChange={(value) => {
							if (!value) return;
							void updateSettings({ lessonLockMode: value as LockMode });
						}}
					>
						<SelectTrigger
							id={`lesson-lock-mode-${program.id}`}
							className="w-full"
							data-testid="program-lesson-lock-mode"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LOCK_MODES.map((mode) => (
								<SelectItem key={mode} value={mode}>
									{MODE_LABELS[mode]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-1.5 max-w-xs">
				<Label htmlFor={`unlock-threshold-${program.id}`}>
					Порог прогресса (%)
				</Label>
				<Input
					id={`unlock-threshold-${program.id}`}
					type="number"
					min={1}
					max={100}
					value={threshold}
					data-testid="program-unlock-threshold"
					onChange={(event) => {
						const next = Number(event.target.value);
						if (!Number.isFinite(next)) return;
						const clamped = Math.min(100, Math.max(1, Math.round(next)));
						void updateSettings({ unlockThresholdPercent: clamped });
					}}
				/>
			</div>

			{topicMode === "graph" ? (
				<div className="flex flex-wrap items-center gap-2">
					<Button
						type="button"
						variant="outline"
						data-testid="topic-lock-graph-open"
						onClick={() => setTopicGraphOpen(true)}
					>
						Редактор зависимостей тем
					</Button>
				</div>
			) : null}

			{lessonMode === "graph" ? (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-muted-foreground">
						Граф уроков редактируется внутри темы:
					</p>
					<div className="flex flex-wrap gap-2">
						{topics.map((topic) => (
							<Button
								key={topic.id}
								type="button"
								variant="outline"
								size="sm"
								data-testid={`lesson-lock-graph-open-${topic.id}`}
								onClick={() => setLessonGraphTopicId(topic.id)}
							>
								{topic.title}
							</Button>
						))}
					</div>
				</div>
			) : null}

			<TopicLockGraphEditor
				open={topicGraphOpen}
				onOpenChange={setTopicGraphOpen}
				programId={program.id}
				topics={topics}
				edges={program.topicLockEdges ?? []}
			/>

			{lessonGraphTopic ? (
				<LessonLockGraphEditor
					open={lessonGraphTopicId != null}
					onOpenChange={(open) => {
						if (!open) setLessonGraphTopicId(null);
					}}
					programId={program.id}
					topicId={lessonGraphTopic.id}
					topicTitle={lessonGraphTopic.title}
					lessons={[...(lessonGraphTopic.topicLessons ?? [])]
						.sort((a, b) => a.position - b.position)
						.map((link) => link.lesson)
						.filter(
							(lesson): lesson is { id: string; title: string } =>
								lesson != null,
						)
						.map((lesson, index) => ({
							id: lesson.id,
							title: lesson.title,
							position: index,
						}))}
					edges={(program.lessonLockEdges ?? []).filter(
						(edge) => edge.topicId === lessonGraphTopic.id,
					)}
				/>
			) : null}
		</section>
	);
}
