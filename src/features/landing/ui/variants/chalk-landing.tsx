import {
	LANDING_ABOUT,
	LANDING_AUDIENCE,
	LANDING_BRAND,
	LANDING_HERO,
	LANDING_IMAGES,
	LANDING_STATS,
	LANDING_WHY,
} from "#/features/landing/lib/content";
import { LandingFooter } from "#/features/landing/ui/landing-footer";
import { LandingNav } from "#/features/landing/ui/landing-nav";
import { ReviewsMarquee } from "#/features/landing/ui/reviews-marquee";
import {
	LandingFaqSection,
	LandingFormatsSection,
	LandingTrialSection,
} from "#/features/landing/ui/shared-sections";
import { SocialLinks } from "#/features/landing/ui/social-links";
import { Button } from "@/components/ui/button";

function ChalkGeometry() {
	return (
		<svg
			className="pointer-events-none absolute inset-0 h-full w-full"
			viewBox="0 0 1200 800"
			aria-hidden
		>
			<title>Геометрия</title>
			<defs>
				<pattern
					id="chalk-grid"
					width="40"
					height="40"
					patternUnits="userSpaceOnUse"
				>
					<path
						d="M 40 0 L 0 0 0 40"
						fill="none"
						stroke="rgba(13,115,119,0.12)"
						strokeWidth="1"
					/>
				</pattern>
			</defs>
			<rect width="1200" height="800" fill="url(#chalk-grid)" />
			<path
				d="M 80 620 Q 320 120 600 420 T 1120 180"
				fill="none"
				stroke="rgba(13,115,119,0.55)"
				strokeWidth="2"
				className="landing-chalk-stroke"
			/>
			<path
				d="M 140 700 L 420 240 L 700 700"
				fill="none"
				stroke="rgba(255,107,91,0.45)"
				strokeWidth="1.5"
				className="landing-chalk-stroke landing-chalk-stroke-delay"
			/>
			<circle
				cx="600"
				cy="420"
				r="8"
				fill="#FF6B5B"
				className="landing-chalk-focus"
			/>
		</svg>
	);
}

export function ChalkLanding() {
	return (
		<div
			className="landing landing-chalk light"
			data-testid="landing-page-chalk"
			id="top"
		>
			<LandingNav activeVersion="chalk" solid />

			<section className="landing-hero relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#f4f7f6] pb-16 pt-28 text-[#0b1c33] sm:pb-24 sm:pt-24">
				<ChalkGeometry />
				<div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
					<div className="max-w-2xl">
						<p className="landing-fade font-display text-4xl font-semibold tracking-[0.08em] text-[#0D7377] sm:text-5xl md:text-6xl">
							{LANDING_BRAND}
						</p>
						<h1 className="landing-fade landing-fade-delay-1 mt-5 text-balance text-3xl font-medium leading-tight sm:text-4xl md:text-[2.75rem]">
							{LANDING_HERO.headline}
						</h1>
						<p className="landing-fade landing-fade-delay-2 mt-5 text-pretty text-base text-[#0b1c33]/70 sm:text-lg">
							{LANDING_HERO.sub}
						</p>
						<div className="landing-fade landing-fade-delay-3 mt-8 flex flex-wrap gap-3">
							<Button
								asChild
								size="lg"
								className="bg-[#FF6B5B] px-6 text-white hover:bg-[#ff8274]"
							>
								<a href="#trial" data-testid="landing-hero-cta">
									{LANDING_HERO.ctaPrimary}
								</a>
							</Button>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="border-[#0D7377]/35 bg-transparent text-[#0D7377] hover:bg-[#0D7377]/5"
							>
								<a href="#about">{LANDING_HERO.ctaSecondary}</a>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section
				id="about"
				className="scroll-mt-20 border-y border-[#0D7377]/15 bg-white py-20 text-[#0b1c33] sm:py-28"
			>
				<div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
					<div>
						<p className="mb-3 text-sm font-medium tracking-wide text-[#FF6B5B] uppercase">
							{LANDING_ABOUT.eyebrow}
						</p>
						<h2 className="font-display text-3xl font-semibold sm:text-4xl">
							{LANDING_ABOUT.title}
						</h2>
						<p className="mt-5 text-lg text-[#0b1c33]/75">
							{LANDING_ABOUT.bodyPrefix}{" "}
							<span className="font-medium text-[#0D7377]">
								{LANDING_BRAND}
							</span>
							{LANDING_ABOUT.bodySuffix}
						</p>
						<div className="mt-10 grid grid-cols-2 gap-6">
							{LANDING_STATS.map((stat) => (
								<div
									key={stat.value}
									className="rounded-xl border border-[#0D7377]/15 bg-[#f4f7f6] p-4"
								>
									<p className="font-display text-2xl font-semibold text-[#0D7377]">
										{stat.value}
									</p>
									<p className="mt-1 text-sm text-[#0b1c33]/60">{stat.label}</p>
								</div>
							))}
						</div>
						<SocialLinks
							size="lg"
							className="mt-8 [&_a]:text-[#0D7377] [&_a:hover]:text-[#FF6B5B]"
						/>
					</div>
					<img
						src={LANDING_IMAGES.desk}
						alt="Виктория"
						className="aspect-[4/5] w-full rounded-2xl object-cover ring-1 ring-[#0D7377]/20"
					/>
				</div>
			</section>

			<section
				id="audience"
				className="scroll-mt-20 bg-[#0D7377] py-20 text-white sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2 className="font-display max-w-2xl text-3xl font-semibold sm:text-4xl">
						Мои занятия для тебя, если ты…
					</h2>
					<ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{LANDING_AUDIENCE.map((item, index) => (
							<li
								key={item.title}
								className="border border-white/20 bg-white/5 p-5 backdrop-blur-sm"
							>
								<p className="font-display text-sm text-[#FF6B5B]">
									{String(index + 1).padStart(2, "0")}
								</p>
								<h3 className="mt-2 font-display text-xl font-semibold">
									{item.title}
								</h3>
								<p className="mt-2 text-sm text-white/75">{item.text}</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			<LandingFormatsSection
				className="bg-[#f4f7f6] [--pm-amber:#FF6B5B] [--pm-amber-deep:#e25548] [--pm-amber-bright:#ff8274]"
				featuredCardClassName="border-[#FF6B5B] ring-[#FF6B5B]/30"
			/>

			<section className="bg-white py-20 text-[#0b1c33] sm:py-28">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2 className="font-display text-3xl font-semibold sm:text-4xl">
						Почему занятия со мной работают?
					</h2>
					<div className="mt-12 grid gap-8 md:grid-cols-3">
						{LANDING_WHY.map((item) => (
							<div key={item.title} className="relative pl-5">
								<span className="absolute top-1 left-0 h-full w-1 rounded-full bg-[#0D7377]" />
								<h3 className="font-display text-xl font-semibold text-[#0D7377]">
									{item.title}
								</h3>
								<p className="mt-3 text-sm text-[#0b1c33]/70">{item.text}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<LandingTrialSection className="bg-[#0b1c33] [--pm-amber:#FF6B5B] [--pm-amber-bright:#ff8274]" />
			<ReviewsMarquee />
			<LandingFaqSection className="bg-[#f4f7f6] [--pm-amber-deep:#e25548]" />
			<LandingFooter
				testIdPrefix="landing-chalk"
				className="[--pm-amber:#FF6B5B]"
			/>
		</div>
	);
}

export default ChalkLanding;
