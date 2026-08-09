export type GraphEdge = {
	from: string;
	to: string;
};

/**
 * Throws if the directed graph has a self-loop or cycle.
 * `from` blocks `to` (edge direction: blocker → locked node).
 */
export function assertAcyclicEdges(edges: ReadonlyArray<GraphEdge>): void {
	const adjacency = new Map<string, string[]>();

	for (const edge of edges) {
		if (edge.from === edge.to) {
			throw new Error("Lock graph cannot contain self-loops");
		}
		const list = adjacency.get(edge.from);
		if (list) {
			list.push(edge.to);
		} else {
			adjacency.set(edge.from, [edge.to]);
		}
		if (!adjacency.has(edge.to)) {
			adjacency.set(edge.to, []);
		}
	}

	const visiting = new Set<string>();
	const visited = new Set<string>();

	const visit = (node: string): void => {
		if (visited.has(node)) {
			return;
		}
		if (visiting.has(node)) {
			throw new Error("Lock graph cannot contain cycles");
		}
		visiting.add(node);
		for (const next of adjacency.get(node) ?? []) {
			visit(next);
		}
		visiting.delete(node);
		visited.add(node);
	};

	for (const node of adjacency.keys()) {
		visit(node);
	}
}
