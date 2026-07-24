/**
 * TipTap/ProseMirror stopEvent for interactive atom NodeViews.
 *
 * Atom nodes with `draggable: true` get `draggable` on the outer DOM, so the
 * browser starts HTML5 drag from anywhere inside the node. TipTap's default
 * stopEvent only preventDefaults when `event.target === this.dom`, and a full
 * custom stopEvent replaces TipTap's `isDragging` tracking — so returning
 * `true` without preventDefault still leaves native drag active.
 *
 * Protocol:
 * 1. mousedown on `[data-drag-handle]` → arm drag, let PM/TipTap handle
 * 2. drag* while armed → allow
 * 3. any other drag* → preventDefault (kill whole-node HTML5 drag)
 * 4. other events off-handle → stop PM (inputs, Mafs, iframes keep pointers)
 */
let gripDragArmed = false;

function clearGripDragArm() {
	gripDragArmed = false;
}

function armGripDrag() {
	gripDragArmed = true;
	document.addEventListener("dragend", clearGripDragArm, { once: true });
	document.addEventListener("drop", clearGripDragArm, { once: true });
	document.addEventListener("mouseup", clearGripDragArm, { once: true });
}

export function gripOnlyStopEvent({ event }: { event: Event }): boolean {
	const target = event.target;
	if (!(target instanceof Element)) {
		return true;
	}

	const onHandle = Boolean(target.closest("[data-drag-handle]"));
	const isDragEvent = event.type.startsWith("drag");
	const isClickEvent = event.type === "mousedown";

	if (isClickEvent) {
		if (onHandle) {
			armGripDrag();
			return false;
		}
		return true;
	}

	if (isDragEvent) {
		if (gripDragArmed || onHandle) {
			return false;
		}
		event.preventDefault();
		return true;
	}

	if (
		event.type === "drop" ||
		event.type === "copy" ||
		event.type === "paste" ||
		event.type === "cut"
	) {
		return false;
	}

	return !onHandle;
}
