import { useQuery, useZero } from "@rocicorp/zero/react";
import { CheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TheoryRenderer } from "#/features/lesson-editor";
import { theoryHasVideo } from "#/features/lesson-player/lib/theory-has-video";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { Button } from "@/components/ui/button";

type TheoryActivityViewProps = {
	programId: string;
	activityId: string;
	content: unknown;
};

/**
 * VK/YouTube embeds rarely emit usable progress via postMessage under our
 * sandboxed iframe. We listen best-effort (throttled); primary path is the
 * button («Отметить просмотренным» when theory has video, else «Изучено»).
 */
function useBestEffortVideoProgress(opts: {
	programId: string;
	activityId: string;
	enabled: boolean;
	completed: boolean;
}) {
	const zero = useZero();
	const lastSentAt = useRef(0);

	useEffect(() => {
		if (!opts.enabled || opts.completed) {
			return;
		}

		const onMessage = (event: MessageEvent) => {
			const data = event.data;
			if (data == null || typeof data !== "object") {
				return;
			}
			const record = data as Record<string, unknown>;
			const info =
				record.info && typeof record.info === "object"
					? (record.info as Record<string, unknown>)
					: record;
			const currentTime = info.currentTime ?? info.time ?? record.currentTime;
			const duration = info.duration ?? record.duration;
			if (typeof currentTime !== "number" || !Number.isFinite(currentTime)) {
				return;
			}
			const now = Date.now();
			if (now - lastSentAt.current < 5_000) {
				return;
			}
			lastSentAt.current = now;
			const positionSec = Math.max(0, Math.floor(currentTime));
			const videoPercent =
				typeof duration === "number" && duration > 0
					? Math.min(100, Math.max(0, (currentTime / duration) * 100))
					: undefined;
			void zero.mutate(
				mutators.updateVideoProgress({
					programId: opts.programId,
					activityId: opts.activityId,
					videoPositionSec: positionSec,
					videoPercent,
				}),
			);
		};

		window.addEventListener("message", onMessage);
		return () => {
			window.removeEventListener("message", onMessage);
		};
	}, [opts.activityId, opts.completed, opts.enabled, opts.programId, zero]);
}

export function TheoryActivityView({
	programId,
	activityId,
	content,
}: TheoryActivityViewProps) {
	const zero = useZero();
	const [progressRows] = useQuery(queries.myActivityProgress());
	const existing = progressRows?.find(
		(row) => row.activityId === activityId && row.programId === programId,
	);
	const alreadyCompleted = existing?.status === "completed";
	const [optimisticDone, setOptimisticDone] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const hasVideo = theoryHasVideo(content);
	const studied = alreadyCompleted || optimisticDone;
	const markLabel = hasVideo ? "Отметить просмотренным" : "Изучено";
	const doneLabel = hasVideo ? "Просмотрено" : "Изучено";

	useBestEffortVideoProgress({
		programId,
		activityId,
		enabled: hasVideo,
		completed: alreadyCompleted,
	});

	const handleMarkStudied = async () => {
		setError(null);
		setSaving(true);
		setOptimisticDone(true);
		try {
			await zero.mutate(
				mutators.markActivityStudied({
					programId,
					activityId,
					videoPercent: hasVideo ? 100 : undefined,
				}),
			);
		} catch (cause) {
			setOptimisticDone(false);
			const message =
				cause instanceof Error
					? cause.message
					: "Не удалось сохранить прогресс";
			setError(message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<section
			className="space-y-4"
			data-testid={`theory-activity-${activityId}`}
		>
			<TheoryRenderer content={content} />
			<div className="flex flex-col gap-2 border-t border-border pt-4">
				{hasVideo ? (
					<p
						className="text-xs text-muted-foreground"
						data-testid={`video-progress-fallback-${activityId}`}
					>
						Автопрогресс видео в iframe недоступен — отметьте просмотр вручную.
					</p>
				) : null}
				<div className="flex flex-wrap items-center gap-3">
					<Button
						variant={studied ? "secondary" : "default"}
						disabled={studied || saving}
						data-testid={`mark-studied-${activityId}`}
						onClick={() => {
							void handleMarkStudied();
						}}
					>
						{studied ? <CheckIcon /> : null}
						{studied ? doneLabel : markLabel}
					</Button>
				</div>
				{error ? (
					<p
						className="text-sm text-destructive"
						data-testid={`studied-error-${activityId}`}
					>
						{error}
					</p>
				) : null}
				{studied && !error ? (
					<p
						className="text-sm text-muted-foreground"
						data-testid={`studied-note-${activityId}`}
					>
						Прогресс сохранён
					</p>
				) : null}
			</div>
		</section>
	);
}
