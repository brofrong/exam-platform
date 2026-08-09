import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckIcon, HelpCircleIcon, PencilIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { extractPromptText } from "#/features/admin-tests/lib/extract-prompt-text";
import {
	ANSWER_TYPE_LABELS,
	pluralizeTests,
} from "#/features/admin-tests/lib/test-labels";
import { computeTestStats } from "#/features/admin-tests/lib/test-stats";
import { AddTestDialog } from "#/features/admin-tests/ui/add-test-dialog";
import {
	TestGroupFormDialog,
	type TestGroupFormValues,
} from "#/features/admin-tests/ui/test-group-form-dialog";
import {
	EMPTY_TIPTAP_DOC,
	type PublishStatus,
	type TestAnswerType,
} from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import {
	EmptyState,
	EntityRow,
	PageHeader,
	PublishToggle,
	StatusBadge,
} from "@/components/lms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TestGroupDetailPageProps = {
	groupId: string;
};

/** TipTap JSON document — must be JSON-serializable for the Zero mutator arg. */
const promptContentSchema = z.record(z.string(), z.json());
const emptyPrompt = promptContentSchema.parse(EMPTY_TIPTAP_DOC);

export function TestGroupDetailPage({ groupId }: TestGroupDetailPageProps) {
	const zero = useZero();
	const navigate = useNavigate();
	const [group] = useQuery(queries.testGroupById({ id: groupId }));
	const [editOpen, setEditOpen] = useState(false);
	const [addTestOpen, setAddTestOpen] = useState(false);

	if (group === undefined) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка группы тестов…</p>
			</main>
		);
	}

	if (group === null) {
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="admin-test-group-missing"
			>
				<EmptyState
					title="Группа тестов не найдена"
					description="Возможно, её удалили или у вас нет доступа."
					action={
						<Button asChild data-testid="test-group-back-to-list">
							<Link to="/admin/tests">К списку групп</Link>
						</Button>
					}
				/>
			</main>
		);
	}

	const status = (group.status ?? "draft") as PublishStatus;
	const tests = group.tests ?? [];

	const handlePublish = async (published: boolean) => {
		const next: PublishStatus = published ? "published" : "draft";
		await zero.mutate(
			mutators.publishTestGroup({ id: group.id, status: next }),
		);
	};

	const handleUpdate = async (values: TestGroupFormValues) => {
		await zero.mutate(
			mutators.updateTestGroup({
				id: group.id,
				title: values.title,
				description: values.description,
			}),
		);
	};

	const handleAddTest = async (answerType: TestAnswerType) => {
		const id = crypto.randomUUID();
		const needsOptions =
			answerType === "single_choice" || answerType === "multiple_choice";
		await zero.mutate(
			mutators.createTest({
				id,
				groupId: group.id,
				position: tests.length,
				prompt: emptyPrompt,
				answerType,
				options: needsOptions
					? [
							{ id: crypto.randomUUID(), label: "" },
							{ id: crypto.randomUUID(), label: "" },
						]
					: null,
				correctAnswer: null,
			}),
		);
		await navigate({
			to: "/admin/tests/$groupId/tests/$testId",
			params: { groupId: group.id, testId: id },
		});
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-test-group-detail"
		>
			<PageHeader
				title={group.title}
				description={group.description || "Без описания."}
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin/tests"
							className="hover:text-foreground"
							data-testid="test-group-detail-back-link"
						>
							Тесты
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">{group.title}</span>
					</nav>
				}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<StatusBadge
							status={status === "published" ? "published" : "draft"}
						/>
						<PublishToggle
							id={`test-group-publish-${group.id}`}
							published={status === "published"}
							onPublishedChange={(published) => {
								void handlePublish(published);
							}}
						/>
						<Button
							variant="outline"
							data-testid="test-group-edit-open"
							onClick={() => setEditOpen(true)}
						>
							<PencilIcon />
							Редактировать
						</Button>
					</div>
				}
			/>

			<section className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-2">
					<h2 className="font-heading text-lg font-medium">
						Вопросы ({tests.length} {pluralizeTests(tests.length)})
					</h2>
					<Button
						size="sm"
						data-testid="test-add-open"
						onClick={() => setAddTestOpen(true)}
					>
						Добавить тест
					</Button>
				</div>

				{tests.length === 0 ? (
					<EmptyState
						icon={<HelpCircleIcon />}
						title="Пока нет вопросов"
						description="Добавьте первый тест, чтобы начать наполнять группу."
						action={
							<Button
								data-testid="test-add-open-empty"
								onClick={() => setAddTestOpen(true)}
							>
								Добавить тест
							</Button>
						}
					/>
				) : (
					<ul className="flex flex-col gap-2" data-testid="tests-list">
						{tests.map((test, index) => {
							const answerType = test.answerType as TestAnswerType;
							const promptText = extractPromptText(test.prompt);
							const stats = computeTestStats(
								test.attemptAnswers ?? [],
								answerType,
							);
							return (
								<li key={test.id}>
									<EntityRow
										title={promptText || `Вопрос ${index + 1}`}
										subtitle={`${ANSWER_TYPE_LABELS[answerType] ?? answerType}${
											stats.total > 0
												? ` · ${stats.correct} верно / ${stats.incorrect} неверно / ${stats.pending} на проверке`
												: " · ещё нет ответов"
										}`}
										status={
											<Badge
												variant="outline"
												data-testid={`test-badge-${test.id}`}
											>
												{ANSWER_TYPE_LABELS[answerType] ?? answerType}
											</Badge>
										}
										actions={
											<div className="flex items-center gap-2">
												{stats.total > 0 ? (
													<span
														className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex"
														data-testid={`test-error-rate-${test.id}`}
													>
														<CheckIcon className="size-3.5 text-emerald-600" />
														{stats.correct}
														<XIcon className="ml-1 size-3.5 text-destructive" />
														{stats.incorrect}
													</span>
												) : null}
												<Button
													variant="outline"
													size="sm"
													asChild
													data-testid={`test-open-${test.id}`}
												>
													<Link
														to="/admin/tests/$groupId/tests/$testId"
														params={{ groupId: group.id, testId: test.id }}
													>
														Открыть
													</Link>
												</Button>
											</div>
										}
									/>
								</li>
							);
						})}
					</ul>
				)}
			</section>

			<TestGroupFormDialog
				key={group.id}
				open={editOpen}
				onOpenChange={setEditOpen}
				mode="edit"
				initial={{ title: group.title, description: group.description ?? "" }}
				onSubmit={handleUpdate}
			/>

			<AddTestDialog
				open={addTestOpen}
				onOpenChange={setAddTestOpen}
				onSubmit={handleAddTest}
			/>
		</main>
	);
}
