import {
	addEdge,
	Background,
	type Connection,
	Controls,
	type Edge,
	Handle,
	type Node,
	type NodeProps,
	Position,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";

export type LockGraphNodeData = {
	label: string;
};

type LockGraphCanvasProps = {
	nodes: ReadonlyArray<{ id: string; label: string; position: number }>;
	edges: ReadonlyArray<{ id: string; from: string; to: string }>;
	onSave: (edges: ReadonlyArray<{ from: string; to: string }>) => Promise<void>;
	saving?: boolean;
};

function LockNode({ data }: NodeProps<Node<LockGraphNodeData>>) {
	return (
		<div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm min-w-40">
			<Handle type="target" position={Position.Top} />
			<div className="font-medium">{data.label}</div>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}

const nodeTypes = { lock: LockNode };

function LockGraphCanvasInner({
	nodes: inputNodes,
	edges: inputEdges,
	onSave,
	saving,
}: LockGraphCanvasProps) {
	const initialNodes: Node<LockGraphNodeData>[] = useMemo(
		() =>
			[...inputNodes]
				.sort((a, b) => a.position - b.position)
				.map((node, index) => ({
					id: node.id,
					type: "lock",
					position: { x: 80, y: 40 + index * 100 },
					data: { label: node.label },
				})),
		[inputNodes],
	);

	const initialEdges: Edge[] = useMemo(
		() =>
			inputEdges.map((edge) => ({
				id: edge.id,
				source: edge.from,
				target: edge.to,
			})),
		[inputEdges],
	);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	useEffect(() => {
		setNodes(initialNodes);
	}, [initialNodes, setNodes]);

	useEffect(() => {
		setEdges(initialEdges);
	}, [initialEdges, setEdges]);

	const onConnect = useCallback(
		(connection: Connection) => {
			if (!connection.source || !connection.target) return;
			if (connection.source === connection.target) return;
			setEdges((current) => addEdge(connection, current));
		},
		[setEdges],
	);

	const handleSave = async () => {
		await onSave(
			edges.map((edge) => ({
				from: edge.source,
				to: edge.target,
			})),
		);
	};

	return (
		<div className="flex h-[min(70vh,560px)] flex-col gap-3">
			<div className="min-h-0 flex-1 rounded-md border">
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					nodeTypes={nodeTypes}
					fitView
					deleteKeyCode={["Backspace", "Delete"]}
				>
					<Background />
					<Controls />
				</ReactFlow>
			</div>
			<div className="flex justify-end">
				<Button
					type="button"
					data-testid="lock-graph-save"
					disabled={saving}
					onClick={() => {
						void handleSave();
					}}
				>
					{saving ? "Сохранение…" : "Сохранить"}
				</Button>
			</div>
		</div>
	);
}

export function LockGraphCanvas(props: LockGraphCanvasProps) {
	return (
		<ReactFlowProvider>
			<LockGraphCanvasInner {...props} />
		</ReactFlowProvider>
	);
}
