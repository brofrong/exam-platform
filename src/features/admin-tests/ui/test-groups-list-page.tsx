import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ListChecksIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { pluralizeTests } from "#/features/admin-tests/lib/test-labels";
import {
	TestGroupFormDialog,
	type TestGroupFormValues,
} from "#/features/admin-tests/ui/test-group-form-dialog";
import type { PublishStatus } from "#/server/zero/constants";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import {
	EmptyState,
	EntityRow,
	PageHeader,
	StatusBadge,
} from "@/components/lms";
import { Button } from "@/components/ui/button";

export function TestGroupsListPage() {
	const zero = useZero();
	const navigate = useNavigate();
	const [groups] = useQuery(queries.testGroups());
	const [createOpen, setCreateOpen] = useState(false);

	const handleCreate = async (values: TestGroupFormValues) => {
		const id = crypto.randomUUID();
		await zero.mutate(
			mutators.createTestGroup({
				id,
				title: values.title,
				description: values.description,
			}),
		);
		await navigate({
			to: "/admin/tests/$groupId",
			params: { groupId: id },
		});
	};

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-test-groups-list"
		>
			<PageHeader
				title="Тесты"
				description="Банки вопросов для практических activities."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="admin-tests-back"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Тесты</span>
					</nav>
				}
				actions={
					<Button
						data-testid="test-group-create-open"
						onClick={() => setCreateOpen(true)}
					>
						<PlusIcon />
						Новая группа
					</Button>
				}
			/>

			{!groups || groups.length === 0 ? (
				<EmptyState
					icon={<ListChecksIcon />}
					title="Пока нет групп тестов"
					description="Создайте группу и добавьте вопросы, затем используйте её в практических activities."
					action={
						<Button
							data-testid="test-group-create-empty"
							onClick={() => setCreateOpen(true)}
						>
							<PlusIcon />
							Создать группу
						</Button>
					}
				/>
			) : (
				<ul className="flex flex-col gap-2" data-testid="test-groups-list">
					{groups.map((group) => {
						const status = (group.status ?? "draft") as PublishStatus;
						const testCount = group.tests?.length ?? 0;
						const description = group.description?.trim();
						const snippet =
							description && description.length > 140
								? `${description.slice(0, 140)}…`
								: description;
						const countLabel = `${testCount} ${pluralizeTests(testCount)}`;
						return (
							<li key={group.id}>
								<EntityRow
									title={group.title}
									subtitle={snippet ? `${snippet} · ${countLabel}` : countLabel}
									status={
										<StatusBadge
											status={status === "published" ? "published" : "draft"}
										/>
									}
									actions={
										<Button
											variant="outline"
											size="sm"
											asChild
											data-testid={`test-group-open-${group.id}`}
										>
											<Link
												to="/admin/tests/$groupId"
												params={{ groupId: group.id }}
											>
												Открыть
											</Link>
										</Button>
									}
								/>
							</li>
						);
					})}
				</ul>
			)}

			<TestGroupFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				mode="create"
				onSubmit={handleCreate}
			/>
		</main>
	);
}
