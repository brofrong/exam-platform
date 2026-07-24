import { LANDING_REVIEWS } from "#/features/landing/lib/reviews";
import { ReviewCard } from "#/features/landing/ui/review-card";
import { Marquee } from "@/components/ui/marquee";

const FIRST_ROW = LANDING_REVIEWS.filter((_, i) => i % 2 === 0);
const SECOND_ROW = LANDING_REVIEWS.filter((_, i) => i % 2 === 1);

export function ReviewsMarquee() {
	return (
		<section
			id="reviews"
			className="scroll-mt-20 border-t border-white/10 bg-[color:var(--pm-navy)] py-20 text-white sm:py-28"
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<p className="mb-3 text-sm font-medium tracking-wide text-[color:var(--pm-amber)] uppercase">
					Отзывы
				</p>
				<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					Отзывы моих учеников
				</h2>
				<p className="mt-4 max-w-xl text-base text-white/65">
					Реальные сообщения от учеников и родителей — без прикрас.
				</p>
			</div>

			<div className="relative mt-12">
				<Marquee
					pauseOnHover
					className="[--duration:55s] [--gap:1.25rem]"
					data-testid="landing-reviews-marquee"
				>
					{FIRST_ROW.map((review) => (
						<ReviewCard key={review.id} review={review} />
					))}
				</Marquee>
				<Marquee
					reverse
					pauseOnHover
					className="mt-4 [--duration:55s] [--gap:1.25rem]"
				>
					{SECOND_ROW.map((review) => (
						<ReviewCard key={review.id} review={review} />
					))}
				</Marquee>
				<div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[color:var(--pm-navy)] to-transparent sm:w-24" />
				<div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[color:var(--pm-navy)] to-transparent sm:w-24" />
			</div>
		</section>
	);
}
