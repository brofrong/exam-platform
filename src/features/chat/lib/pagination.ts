import { MESSAGE_PAGE_SIZE } from "#/server/zero/constants";

export { MESSAGE_PAGE_SIZE };

export type MessageCursor = {
	createdAt: number;
	id: string;
};

export type PaginatedMessage = {
	id: string;
	createdAt?: number | null;
};

export function sortMessagesAsc<T extends PaginatedMessage>(
	messages: T[],
): T[] {
	return [...messages].sort((left, right) => {
		const leftCreatedAt = left.createdAt ?? 0;
		const rightCreatedAt = right.createdAt ?? 0;
		if (leftCreatedAt !== rightCreatedAt) {
			return leftCreatedAt - rightCreatedAt;
		}
		return left.id.localeCompare(right.id);
	});
}

export function mergeMessagePages<T extends PaginatedMessage>(
	...pages: readonly T[][]
): T[] {
	const byId = new Map<string, T>();
	for (const page of pages) {
		for (const item of page) {
			byId.set(item.id, item);
		}
	}
	return sortMessagesAsc([...byId.values()]);
}

export function getOldestCursor(
	messages: readonly PaginatedMessage[],
): MessageCursor | null {
	if (messages.length === 0) {
		return null;
	}

	const oldest = sortMessagesAsc([...messages])[0];
	if (oldest.createdAt == null) {
		return null;
	}

	return {
		createdAt: oldest.createdAt,
		id: oldest.id,
	};
}

export function hasMoreMessages(
	fetchedCount: number,
	pageSize = MESSAGE_PAGE_SIZE,
): boolean {
	return fetchedCount >= pageSize;
}

export function preserveScrollTop({
	previousScrollHeight,
	previousScrollTop,
	nextScrollHeight,
}: {
	previousScrollHeight: number;
	previousScrollTop: number;
	nextScrollHeight: number;
}): number {
	return previousScrollTop + (nextScrollHeight - previousScrollHeight);
}

export function isNearBottom({
	scrollTop,
	scrollHeight,
	clientHeight,
	threshold = 80,
}: {
	scrollTop: number;
	scrollHeight: number;
	clientHeight: number;
	threshold?: number;
}): boolean {
	return scrollHeight - (scrollTop + clientHeight) <= threshold;
}
