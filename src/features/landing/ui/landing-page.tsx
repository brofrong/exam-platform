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
import { Particles } from "@/components/ui/particles";

export function LandingPage() {
	return (
		<div className="landing light" data-testid="landing-page" id="top">
			<LandingNav activeVersion="original" />

			<section className="landing-hero relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[color:var(--pm-navy)] pb-16 pt-28 sm:pb-24 sm:pt-24">
				<Particles
					className="absolute inset-0"
					quantity={140}
					ease={70}
					staticity={40}
					size={0.5}
					color="#e8a54b"
				/>
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_oklab,var(--pm-navy)_55%,transparent)_70%,var(--pm-navy)_100%)]" />

				<div className="relative z-10 mx-auto flex w-full max-w-6xl justify-center px-4 text-center sm:px-6">
					<div className="w-full max-w-2xl">
						<p className="landing-fade font-display mb-4 text-4xl font-semibold tracking-[0.06em] text-white sm:text-5xl md:text-6xl">
							{LANDING_BRAND}
						</p>
						<h1 className="landing-fade landing-fade-delay-1 text-balance text-3xl font-medium leading-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
							{LANDING_HERO.headline}
						</h1>
						<p className="landing-fade landing-fade-delay-2 mt-5 text-pretty text-base text-white/80 sm:text-lg">
							{LANDING_HERO.sub}
						</p>
						<div className="landing-fade landing-fade-delay-3 mt-8 flex flex-wrap justify-center gap-3">
							<Button
								asChild
								size="lg"
								className="bg-[color:var(--pm-amber)] px-6 text-[color:var(--pm-navy)] hover:bg-[color:var(--pm-amber-bright)]"
							>
								<a href="#trial" data-testid="landing-hero-cta">
									{LANDING_HERO.ctaPrimary}
								</a>
							</Button>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
							>
								<a href="#about">{LANDING_HERO.ctaSecondary}</a>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section
				id="about"
				className="scroll-mt-20 border-b border-white/10 bg-[color:var(--pm-navy)] py-20 text-white sm:py-28"
			>
				<div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
					<div>
						<p className="mb-3 text-sm font-medium tracking-wide text-[color:var(--pm-amber)] uppercase">
							{LANDING_ABOUT.eyebrow}
						</p>
						<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
							{LANDING_ABOUT.title}
						</h2>
						<p className="mt-5 max-w-xl text-pretty text-lg text-white/75">
							{LANDING_ABOUT.bodyPrefix}{" "}
							<span className="text-white">{LANDING_BRAND}</span>
							{LANDING_ABOUT.bodySuffix}
						</p>
						<div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
							{LANDING_STATS.map((stat) => (
								<div key={stat.value}>
									<p className="font-display whitespace-nowrap text-2xl font-semibold text-[color:var(--pm-amber)] sm:text-3xl">
										{stat.value}
									</p>
									<p className="mt-1 text-sm text-white/65">{stat.label}</p>
								</div>
							))}
						</div>

						<div className="mt-10">
							<p className="mb-4 text-sm font-medium tracking-wide text-[color:var(--pm-amber)] uppercase">
								Соцсети
							</p>
							<SocialLinks
								size="lg"
								showLabels
								data-testid="landing-about-socials"
							/>
						</div>

						<Button
							asChild
							variant="link"
							className="mt-8 h-auto px-0 text-[color:var(--pm-amber)]"
						>
							<a href="#formats">{LANDING_ABOUT.moreLink}</a>
						</Button>
					</div>
					<div className="relative">
						<div className="absolute -inset-3 rounded-[2rem] bg-[color:var(--pm-amber)]/15 blur-2xl" />
						<img
							src={LANDING_IMAGES.desk}
							alt="Виктория — преподаватель PHYS&MATH"
							className="relative aspect-[4/5] w-full rounded-[1.5rem] object-cover shadow-2xl shadow-black/40 sm:aspect-[5/6]"
						/>
					</div>
				</div>
			</section>

			<section
				id="audience"
				className="scroll-mt-20 bg-[color:var(--pm-ink)] py-20 text-white sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="mb-3 text-sm font-medium tracking-wide text-[color:var(--pm-amber)] uppercase">
						Для кого
					</p>
					<h2 className="font-display max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
						Мои занятия для тебя, если ты…
					</h2>
					<ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{LANDING_AUDIENCE.map((item, index) => (
							<li key={item.title} className="border-t border-white/15 pt-5">
								<p className="text-xs tracking-[0.2em] text-white/40">
									{String(index + 1).padStart(2, "0")}
								</p>
								<h3 className="mt-3 font-display text-xl font-semibold whitespace-nowrap">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-white/70">
									{item.text}
								</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			<LandingFormatsSection />
			<LandingTrialSection />

			<section className="bg-[color:var(--pm-ink)] py-20 text-white sm:py-28">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2 className="font-display max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
						Почему занятия со мной работают?
					</h2>
					<div className="mt-12 grid gap-10 md:grid-cols-3">
						{LANDING_WHY.map((item) => (
							<div key={item.title}>
								<h3 className="font-display text-xl font-semibold whitespace-nowrap text-[color:var(--pm-amber)]">
									{item.title}
								</h3>
								<p className="mt-3 text-sm leading-relaxed text-white/70">
									{item.text}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<ReviewsMarquee />
			<LandingFaqSection />
			<LandingFooter />
		</div>
	);
}
