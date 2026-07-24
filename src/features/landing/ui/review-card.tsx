import { Star } from "lucide-react";
import type { LandingReview } from "#/features/landing/lib/reviews";
import { cn } from "@/lib/utils";

const STAR_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;

type ReviewCardProps = {
	review: LandingReview;
	className?: string;
};

export function ReviewCard({ review, className }: ReviewCardProps) {
	return (
		<figure
			className={cn(
				"relative flex w-80 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:w-96 sm:p-6",
				className,
			)}
		>
			<div>
				<p className="sr-only">Оценка 5 из 5</p>
				<div className="flex items-center gap-0.5" aria-hidden="true">
					{STAR_KEYS.map((key) => (
						<Star
							key={key}
							className="size-3.5 fill-[color:var(--pm-amber)] text-[color:var(--pm-amber)]"
						/>
					))}
				</div>
				<blockquote className="mt-4 text-sm leading-relaxed text-white/85">
					«{review.quote}»
				</blockquote>
			</div>
			<figcaption className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
				<span
					className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--pm-amber)]/20 text-xs font-semibold text-[color:var(--pm-amber)]"
					aria-hidden
				>
					{review.name.slice(0, 1)}
				</span>
				<div className="min-w-0">
					<p className="truncate text-sm font-medium text-white">
						{review.name}
					</p>
					<p className="truncate text-xs text-white/50">{review.meta}</p>
				</div>
			</figcaption>
		</figure>
	);
}
