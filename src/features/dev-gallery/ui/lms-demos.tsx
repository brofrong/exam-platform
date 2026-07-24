"use client";

import { InboxIcon } from "lucide-react";
import { useState } from "react";
import {
	ConfirmActionDialog,
	ContinueLearningCard,
	EmptyState,
	EntityRow,
	FileDropzone,
	PageHeader,
	PendingReviewList,
	ProgramCard,
	ProgressStat,
	PublishToggle,
	StatCard,
	StatusBadge,
	SupportMessageBubble,
	VideoEmbedFrame,
} from "@/components/lms";
import { Button } from "@/components/ui/button";

export function PageHeaderDemo() {
	return (
		<PageHeader
			className="w-full"
			title="Программы"
			description="Каталог курсов подготовки к ЕГЭ и ОГЭ."
			actions={
				<>
					<Button variant="outline" size="sm">
						Фильтры
					</Button>
					<Button size="sm">Создать</Button>
				</>
			}
		/>
	);
}

export function EmptyStateDemo() {
	return (
		<EmptyState
			className="max-w-md"
			icon={<InboxIcon />}
			title="Пока нет программ"
			description="Когда вам выдадут доступ, программы появятся здесь."
			action={
				<Button size="sm" variant="outline">
					Обновить
				</Button>
			}
		/>
	);
}

export function StatCardDemo() {
	return (
		<div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
			<StatCard label="Пройдено уроков" value={12} hint="из 40" />
			<StatCard label="На проверке" value={3} />
			<StatCard label="Средний балл" value="86%" hint="за неделю" />
		</div>
	);
}

export function ProgressStatDemo() {
	return (
		<div className="grid w-full max-w-md gap-4">
			<ProgressStat
				label="Программа «Математика ЕГЭ»"
				value={68}
				description="14 из 21 урока"
			/>
			<ProgressStat label="Текущий урок" value={35} />
		</div>
	);
}

export function StatusBadgeDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<StatusBadge status="draft" />
			<StatusBadge status="published" />
			<StatusBadge status="pending" />
			<StatusBadge status="graded" />
			<StatusBadge status="correct" />
			<StatusBadge status="incorrect" />
		</div>
	);
}

export function ProgramCardDemo() {
	return (
		<ProgramCard
			title="Математика · Профиль"
			description="Квадратные уравнения, тригонометрия и стереометрия."
			examType="ЕГЭ"
			subject="Математика"
			progress={42}
			onOpen={() => undefined}
		/>
	);
}

export function ContinueLearningCardDemo() {
	return (
		<ContinueLearningCard
			programTitle="Русский язык · ЕГЭ"
			lessonTitle="Сочинение: структура и критерии"
			progress={55}
			onContinue={() => undefined}
		/>
	);
}

export function PendingReviewListDemo() {
	return (
		<PendingReviewList
			className="w-full max-w-lg"
			items={[
				{
					id: "1",
					title: "Задача с файлом: график функции",
					subtitle: "Математика · Урок 4",
					submittedAt: "сегодня",
				},
				{
					id: "2",
					title: "Развёрнутый ответ: сочинение",
					subtitle: "Русский язык · Урок 8",
					submittedAt: "вчера",
				},
			]}
			onItemClick={() => undefined}
		/>
	);
}

export function FileDropzoneDemo() {
	const [name, setName] = useState<string | null>(null);

	return (
		<div className="grid w-full max-w-md gap-2">
			<FileDropzone
				accept=".pdf,.png,.jpg,.jpeg"
				onFile={(file) => setName(file.name)}
			/>
			{name ? (
				<p className="text-xs text-muted-foreground">Выбран: {name}</p>
			) : null}
		</div>
	);
}

export function PublishToggleDemo() {
	const [published, setPublished] = useState(false);

	return (
		<PublishToggle published={published} onPublishedChange={setPublished} />
	);
}

export function EntityRowDemo() {
	return (
		<div className="grid w-full max-w-lg gap-2">
			<EntityRow
				draggable
				title="Квадратные уравнения"
				subtitle="Урок · 4 activity"
				status={<StatusBadge status="published" />}
				actions={
					<Button size="sm" variant="ghost">
						Изменить
					</Button>
				}
			/>
			<EntityRow
				draggable
				title="Черновик темы"
				subtitle="Тема · без уроков"
				status={<StatusBadge status="draft" />}
			/>
		</div>
	);
}

export function SupportMessageBubbleDemo() {
	return (
		<div className="grid w-full max-w-md gap-3">
			<SupportMessageBubble
				side="incoming"
				authorName="Преподаватель"
				timestamp="10:12"
				body="Пришлите файл с решением — проверю сегодня вечером."
			/>
			<SupportMessageBubble
				side="outgoing"
				authorName="Вы"
				timestamp="10:15"
				body="Отправил PDF в задании урока 4."
			/>
		</div>
	);
}

export function VideoEmbedFrameDemo() {
	return (
		<VideoEmbedFrame
			className="w-full max-w-xl"
			title="Демо видео"
			embedUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
		/>
	);
}

export function ConfirmActionDialogDemo() {
	return (
		<ConfirmActionDialog
			destructive
			title="Удалить урок?"
			description="Урок будет удалён из каталога. Это действие нельзя отменить."
			confirmLabel="Удалить"
			onConfirm={() => undefined}
			trigger={
				<Button variant="destructive" data-testid="confirm-action-trigger">
					Удалить урок
				</Button>
			}
		/>
	);
}
