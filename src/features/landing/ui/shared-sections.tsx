import { Check } from "lucide-react";
import {
	LANDING_FAQ,
	LANDING_FORMATS,
	LANDING_TRIAL,
} from "#/features/landing/lib/content";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingFormatsSection({
	className,
	cardClassName,
	featuredCardClassName,
}: {
	className?: string;
	cardClassName?: string;
	featuredCardClassName?: string;
}) {
	return (
		<section
			id="formats"
			className={cn(
				"scroll-mt-20 bg-[color:var(--pm-cream)] py-20 text-[color:var(--pm-navy)] sm:py-28",
				className,
			)}
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="mx-auto max-w-2xl text-center">
					<p className="mb-3 text-sm font-medium tracking-wide text-[color:var(--pm-amber-deep)] uppercase">
						Форматы
					</p>
					<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
						Как мы можем работать с тобой?
					</h2>
					<p className="mt-4 text-base text-[color:var(--pm-navy)]/70">
						Три понятных варианта — выбери тот, который совпадает с твоим темпом
						и целью.
					</p>
				</div>

				<div className="mt-14 grid gap-6 lg:grid-cols-3 lg:[grid-template-rows:auto_auto_auto]">
					{LANDING_FORMATS.map((format) => (
						<article
							key={format.id}
							id={format.id}
							className={cn(
								"flex flex-col rounded-2xl border bg-white p-6 shadow-sm sm:p-7 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-0",
								format.featured
									? cn(
											"border-[color:var(--pm-amber)] ring-1 ring-[color:var(--pm-amber)]/40",
											featuredCardClassName,
										)
									: cn("border-[color:var(--pm-navy)]/10", cardClassName),
							)}
						>
							<div className="flex h-full flex-col">
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="font-display whitespace-nowrap text-xl font-semibold sm:text-2xl">
										{format.title}
									</h3>
									{format.featured ? (
										<span className="shrink-0 rounded-full bg-[color:var(--pm-amber)]/15 px-2.5 py-1 text-[11px] font-medium tracking-wide whitespace-nowrap text-[color:var(--pm-amber-deep)] uppercase">
											Чаще выбирают
										</span>
									) : null}
								</div>

								<p className="mt-5 font-display whitespace-nowrap text-3xl font-semibold tracking-tight sm:text-4xl">
									{format.highlight}
								</p>
								<p className="mt-1 text-sm text-[color:var(--pm-navy)]/55">
									{format.highlightHint}
								</p>
								<p className="mt-4 text-sm leading-relaxed text-[color:var(--pm-navy)]/75">
									{format.lead}
								</p>
								<p className="mt-3 text-sm font-medium text-[color:var(--pm-navy)]">
									{format.why}
								</p>

								<div className="mt-auto pt-6">
									<Button
										asChild
										className={cn(
											"w-full",
											format.featured
												? "bg-[color:var(--pm-amber)] text-[color:var(--pm-navy)] hover:bg-[color:var(--pm-amber-bright)]"
												: "bg-[color:var(--pm-navy)] text-white hover:bg-[color:var(--pm-navy)]/90",
										)}
									>
										<a href="#trial">{format.cta}</a>
									</Button>
								</div>
							</div>

							<div className="mt-7 border-t border-[color:var(--pm-navy)]/10 pt-6 lg:mt-0 lg:pt-7">
								<p className="text-xs font-medium tracking-wide text-[color:var(--pm-navy)]/50 uppercase">
									Что внутри
								</p>
								<ul className="mt-4 space-y-3">
									{format.points.map((point) => (
										<li
											key={point}
											className="flex gap-2.5 text-sm leading-relaxed text-[color:var(--pm-navy)]/80"
										>
											<Check
												className="mt-0.5 size-4 shrink-0 text-[color:var(--pm-amber-deep)]"
												aria-hidden
											/>
											{point}
										</li>
									))}
								</ul>
							</div>

							{format.variants ? (
								<div className="mt-6 rounded-xl bg-[color:var(--pm-cream)]/80 p-4 lg:mt-0 lg:pt-6">
									<p className="text-xs font-medium tracking-wide text-[color:var(--pm-amber-deep)] uppercase">
										Варианты
									</p>
									<ul className="mt-2 space-y-1.5 text-sm text-[color:var(--pm-navy)]/75">
										{format.variants.map((line) => (
											<li key={line}>{line}</li>
										))}
									</ul>
								</div>
							) : (
								<div className="hidden lg:block" aria-hidden />
							)}
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

export function LandingTrialSection({ className }: { className?: string }) {
	return (
		<section
			id="trial"
			className={cn(
				"scroll-mt-20 bg-[color:var(--pm-navy)] py-24 sm:py-32",
				className,
			)}
		>
			<div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
				<h2 className="font-display text-balance text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
					{LANDING_TRIAL.title}
				</h2>
				<p className="mx-auto mt-5 max-w-xl text-pretty text-white/75">
					{LANDING_TRIAL.body}
				</p>
				<Button
					asChild
					size="lg"
					className="mt-8 bg-[color:var(--pm-amber)] px-8 text-[color:var(--pm-navy)] hover:bg-[color:var(--pm-amber-bright)]"
				>
					<a
						href={LANDING_TRIAL.href}
						target="_blank"
						rel="noreferrer"
						data-testid="landing-trial-cta"
					>
						{LANDING_TRIAL.cta}
					</a>
				</Button>
			</div>
		</section>
	);
}

export function LandingFaqSection({ className }: { className?: string }) {
	return (
		<section
			id="faq"
			className={cn(
				"scroll-mt-20 bg-[color:var(--pm-cream)] py-20 text-[color:var(--pm-navy)] sm:py-28",
				className,
			)}
		>
			<div className="mx-auto max-w-3xl px-4 sm:px-6">
				<p className="mb-3 text-sm font-medium tracking-wide text-[color:var(--pm-amber-deep)] uppercase">
					Вопросы
				</p>
				<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					Остались вопросы?
				</h2>
				<Accordion type="single" collapsible className="mt-10 w-full">
					{LANDING_FAQ.map((item) => (
						<AccordionItem key={item.q} value={item.q}>
							<AccordionTrigger className="text-left text-base font-medium">
								{item.q}
							</AccordionTrigger>
							<AccordionContent className="text-[color:var(--pm-navy)]/75">
								{item.a}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
