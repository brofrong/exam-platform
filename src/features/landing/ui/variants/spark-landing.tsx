import {
	LANDING_AUDIENCE,
	LANDING_BRAND,
	LANDING_FAQ,
	LANDING_FORMATS,
	LANDING_IMAGES,
	LANDING_STATS,
	LANDING_TRIAL,
	LANDING_WHY,
} from "#/features/landing/lib/content";
import { LANDING_REVIEWS } from "#/features/landing/lib/reviews";
import { LandingFooter } from "#/features/landing/ui/landing-footer";
import { LandingNav } from "#/features/landing/ui/landing-nav";
import { SocialLinks } from "#/features/landing/ui/social-links";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const NAV = [
	{ href: "#about", label: "Обо мне" },
	{ href: "#audience", label: "Для кого" },
	{ href: "#formats", label: "Виды работы" },
	{ href: "#probniy", label: "Пробный" },
	{ href: "#reviews", label: "Отзывы" },
	{ href: "#faq", label: "FAQ" },
] as const;

function DoodleUnderline({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 200 12" fill="none" aria-hidden>
			<title>подчёркивание</title>
			<path
				d="M2 8c40-6 80 4 120-2s56-2 76 2"
				stroke="#d26939"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function DoodleBurst({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
			<title>искры</title>
			<path
				d="M20 2v8M20 30v8M2 20h8M30 20h8M7 7l5.5 5.5M27.5 27.5L33 33M33 7l-5.5 5.5M7 33l5.5-5.5"
				stroke="#d26939"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function DoodleCrown({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 80 40" fill="none" aria-hidden>
			<title>корона</title>
			<path
				d="M8 32 L16 12 L28 24 L40 6 L52 24 L64 12 L72 32 Z"
				stroke="#d26939"
				strokeWidth="2.5"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

/**
 * Spark — scrapbook / SPEAKY-inspired.
 * Paper cream, burnt orange doodles, B&W polaroids, script accents.
 */
export function SparkLanding() {
	return (
		<div
			className="landing landing-spark light"
			data-testid="landing-page-spark"
			id="top"
		>
			<LandingNav activeVersion="spark" solid tone="light" links={NAV} />

			{/* Hero — torn split collage */}
			<section className="landing-spark-paper relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28">
				<div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-0">
					{/* Collage */}
					<div className="landing-spark-torn relative mx-auto w-full max-w-md lg:max-w-none">
						<div className="relative">
							<img
								src={LANDING_IMAGES.portrait}
								alt="Виктория"
								className="landing-spark-bw aspect-[4/5] w-full object-cover"
							/>
							<DoodleCrown className="landing-spark-float absolute top-4 right-[18%] w-16 sm:w-20" />
							<svg
								className="pointer-events-none absolute inset-0 h-full w-full"
								viewBox="0 0 400 500"
								aria-hidden
							>
								<title>дудлы</title>
								<path
									d="M70 90 Q 200 60 320 110"
									stroke="#d26939"
									strokeWidth="2.5"
									fill="none"
									strokeLinecap="round"
								/>
								<path
									d="M90 380 Q 180 420 300 360"
									stroke="#d26939"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
								/>
							</svg>

							{/* Polaroids */}
							<figure
								className="landing-spark-polaroid absolute -bottom-6 -left-3 w-[38%] bg-white p-1.5 shadow-lg sm:-left-6 sm:p-2"
								style={{ ["--spark-rot" as string]: "-8deg" }}
							>
								<img
									src={LANDING_IMAGES.whiteboard}
									alt=""
									className="landing-spark-bw aspect-square w-full object-cover"
								/>
							</figure>
							<figure
								className="landing-spark-polaroid absolute -right-2 bottom-16 w-[32%] bg-white p-1.5 shadow-lg sm:-right-4 sm:p-2"
								style={{ ["--spark-rot" as string]: "7deg" }}
							>
								<img
									src={LANDING_IMAGES.desk}
									alt=""
									className="landing-spark-bw aspect-[3/4] w-full object-cover"
								/>
							</figure>
						</div>
					</div>

					{/* Copy */}
					<div className="relative z-10 text-center lg:pl-10 lg:text-left">
						<img
							src={LANDING_IMAGES.portrait2}
							alt=""
							className="landing-fade mx-auto mb-5 size-16 rounded-full object-cover ring-2 ring-[#d26939]/40 sm:size-20 lg:mx-0"
						/>
						<h1 className="landing-fade landing-fade-delay-1 text-balance text-3xl font-bold leading-[1.15] text-[#1a1a1a] sm:text-4xl md:text-[2.75rem]">
							Необязательно быть «гением», чтобы{" "}
							<span className="landing-spark-script relative inline-block text-[#d26939]">
								сдать
								<DoodleUnderline className="absolute -bottom-1 left-0 w-full" />
							</span>{" "}
							ЕГЭ и ОГЭ
						</h1>
						<p className="landing-fade landing-fade-delay-2 landing-spark-script mt-5 text-xl text-[#d26939] sm:text-2xl">
							Разберём всё по шагам вместе ♡
						</p>
						<div className="landing-fade landing-fade-delay-3 relative mt-8 inline-flex items-center justify-center gap-3">
							<DoodleBurst className="hidden size-8 sm:block" />
							<Button
								asChild
								size="lg"
								className="rounded-full bg-[#d26939] px-8 text-base text-white hover:bg-[#b5542a]"
							>
								<a href="#probniy" data-testid="landing-hero-cta">
									Записаться на занятие
								</a>
							</Button>
							<DoodleBurst className="hidden size-8 sm:block" />
						</div>
					</div>
				</div>
			</section>

			{/* About */}
			<section
				id="about"
				className="landing-spark-paper scroll-mt-20 border-t border-[#d26939]/15 py-20 sm:py-28"
			>
				<div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
					<div>
						<p className="landing-spark-script text-2xl text-[#d26939]">
							Обо мне
						</p>
						<h2 className="mt-2 font-display text-3xl font-bold text-[#1a1a1a] sm:text-4xl">
							Привет! Я Виктория
						</h2>
						<p className="mt-5 max-w-lg text-lg leading-relaxed text-[#1a1a1a]/75">
							Преподаватель физики и математики и создатель{" "}
							<span className="font-semibold text-[#d26939]">
								{LANDING_BRAND}
							</span>
							. Три высших, эксперт ЕГЭ — и атмосфера, в которой формулы
							перестают пугать.
						</p>
						<a
							href="#formats"
							className="landing-spark-script mt-6 inline-block text-lg text-[#d26939] underline decoration-wavy underline-offset-4"
						>
							Жми сюда, чтобы узнать больше обо мне
						</a>
						<SocialLinks
							size="lg"
							showLabels
							className="mt-8 [&_a]:text-[#d26939] [&_a:hover]:bg-[#d26939]/10 [&_span]:text-[#1a1a1a]/80"
						/>
					</div>
					<div className="relative">
						<img
							src={LANDING_IMAGES.about}
							alt="Виктория"
							className="aspect-[5/6] w-full rounded-[2rem] object-cover shadow-xl"
						/>
						<div className="absolute -bottom-6 -left-2 flex flex-wrap gap-2 sm:-left-4">
							{LANDING_STATS.slice(0, 3).map((stat) => (
								<span
									key={stat.value}
									className="rounded-full border-2 border-[#d26939] bg-[#f5efe6] px-3 py-1.5 text-sm font-semibold text-[#1a1a1a] shadow-sm"
								>
									{stat.value}{" "}
									<span className="font-normal text-[#1a1a1a]/55">
										{stat.label}
									</span>
								</span>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Audience */}
			<section
				id="audience"
				className="scroll-mt-20 bg-[#1a1a1a] py-20 text-[#f5efe6] sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2 className="max-w-xl text-3xl font-bold sm:text-4xl">
						Мои занятия для{" "}
						<span className="landing-spark-script text-[#d26939]">тебя</span>,
						если ты…
					</h2>
					<ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{LANDING_AUDIENCE.map((item) => (
							<li
								key={item.title}
								className="rounded-3xl border border-[#f5efe6]/15 bg-[#f5efe6]/5 p-5"
							>
								<h3 className="landing-spark-script text-xl text-[#d26939]">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-[#f5efe6]/70">
									{item.text}
								</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Formats */}
			<section
				id="formats"
				className="landing-spark-paper scroll-mt-20 py-20 sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2 className="text-center text-3xl font-bold text-[#1a1a1a] sm:text-4xl">
						Как мы можем{" "}
						<span className="landing-spark-script text-[#d26939]">
							работать
						</span>{" "}
						с тобой?
					</h2>
					<div className="mt-14 grid gap-6 lg:grid-cols-3 lg:[grid-template-rows:auto_auto]">
						{LANDING_FORMATS.map((format) => (
							<article
								key={format.id}
								id={format.id}
								className={`flex flex-col rounded-[2rem] border-2 bg-white p-6 shadow-sm lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:gap-0 ${
									format.featured
										? "border-[#d26939] rotate-[-1deg]"
										: "border-[#1a1a1a]/10"
								}`}
							>
								<div className="flex h-full flex-col">
									{format.featured ? (
										<span className="landing-spark-script mb-2 text-[#d26939]">
											чаще выбирают ♡
										</span>
									) : null}
									<h3 className="text-xl font-bold text-[#1a1a1a]">
										{format.title}
									</h3>
									<p className="mt-3 text-3xl font-bold text-[#d26939]">
										{format.highlight}
									</p>
									<p className="mt-1 text-sm text-[#1a1a1a]/55">
										{format.highlightHint}
									</p>
									<p className="mt-4 text-sm leading-relaxed text-[#1a1a1a]/75">
										{format.lead}
									</p>
									<div className="mt-auto pt-6">
										<Button
											asChild
											className="w-full rounded-full bg-[#d26939] text-white hover:bg-[#b5542a]"
										>
											<a href="#probniy">{format.cta}</a>
										</Button>
									</div>
								</div>
								<ul className="mt-6 space-y-2 border-t border-[#1a1a1a]/10 pt-5 lg:mt-0 lg:pt-6">
									{format.points.map((point) => (
										<li
											key={point}
											className="text-sm text-[#1a1a1a]/70 before:mr-2 before:text-[#d26939] before:content-['✦']"
										>
											{point}
										</li>
									))}
								</ul>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Trial — like #probniy */}
			<section
				id="probniy"
				className="scroll-mt-20 bg-[#d26939] py-24 text-center text-white sm:py-32"
			>
				<div className="mx-auto max-w-2xl px-4">
					<p className="landing-spark-script text-2xl text-white/90">
						бесплатный урок
					</p>
					<h2 className="mt-3 text-3xl font-bold sm:text-5xl">
						Начни заниматься физикой или математикой уже сегодня!
					</h2>
					<p className="mx-auto mt-5 max-w-lg text-white/85">
						{LANDING_TRIAL.body}
					</p>
					<div className="relative mt-10 inline-flex items-center gap-3">
						<DoodleBurst className="size-9 [&_path]:stroke-white" />
						<Button
							asChild
							size="lg"
							className="rounded-full bg-white px-10 text-[#d26939] hover:bg-[#f5efe6]"
						>
							<a
								href={LANDING_TRIAL.href}
								target="_blank"
								rel="noreferrer"
								data-testid="landing-trial-cta"
							>
								Хочу на урок
							</a>
						</Button>
						<DoodleBurst className="size-9 [&_path]:stroke-white" />
					</div>
				</div>
			</section>

			{/* Why */}
			<section className="landing-spark-paper py-20 sm:py-28">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2 className="text-3xl font-bold text-[#1a1a1a] sm:text-4xl">
						Почему занятия{" "}
						<span className="landing-spark-script text-[#d26939]">со мной</span>{" "}
						работают?
					</h2>
					<div className="mt-12 grid gap-8 md:grid-cols-3">
						{LANDING_WHY.map((item) => (
							<div
								key={item.title}
								className="rounded-3xl border border-[#d26939]/25 bg-white/60 p-6"
							>
								<h3 className="landing-spark-script text-2xl text-[#d26939]">
									{item.title}
								</h3>
								<p className="mt-3 text-sm leading-relaxed text-[#1a1a1a]/7">
									{item.text}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Reviews */}
			<section
				id="reviews"
				className="scroll-mt-20 bg-[#1a1a1a] py-20 text-[#f5efe6] sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2 className="text-3xl font-bold sm:text-4xl">
						Отзывы{" "}
						<span className="landing-spark-script text-[#d26939]">
							моих учеников
						</span>
					</h2>
					<p className="landing-spark-script mt-2 text-lg text-[#d26939]/80">
						Листай →
					</p>
					<div className="landing-spark-scroll mt-10 flex gap-4 overflow-x-auto pb-4">
						{LANDING_REVIEWS.map((review) => (
							<figure
								key={review.id}
								className="w-[min(85vw,20rem)] shrink-0 rounded-3xl border border-[#f5efe6]/15 bg-[#f5efe6]/5 p-5"
							>
								<blockquote className="text-sm leading-relaxed text-[#f5efe6]/85">
									«{review.quote}»
								</blockquote>
								<figcaption className="mt-4 text-sm">
									<span className="font-semibold text-[#d26939]">
										{review.name}
									</span>
									<span className="text-[#f5efe6]/45"> · {review.meta}</span>
								</figcaption>
							</figure>
						))}
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section
				id="faq"
				className="landing-spark-paper scroll-mt-20 py-20 sm:py-28"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<h2 className="text-3xl font-bold text-[#1a1a1a] sm:text-4xl">
						Остались{" "}
						<span className="landing-spark-script text-[#d26939]">вопросы</span>
						?
					</h2>
					<Accordion type="single" collapsible className="mt-10 w-full">
						{LANDING_FAQ.map((item) => (
							<AccordionItem
								key={item.q}
								value={item.q}
								className="border-[#d26939]/20"
							>
								<AccordionTrigger className="text-left text-base font-medium text-[#1a1a1a]">
									{item.q}
								</AccordionTrigger>
								<AccordionContent className="text-[#1a1a1a]/7">
									{item.a}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>

			{/* Second CTA */}
			<section className="bg-[#d26939] py-16 text-center text-white">
				<div className="mx-auto max-w-xl px-4">
					<h2 className="text-2xl font-bold sm:text-3xl">
						Можем поболтать вместе
					</h2>
					<Button
						asChild
						size="lg"
						className="mt-6 rounded-full bg-white px-8 text-[#d26939] hover:bg-[#f5efe6]"
					>
						<a href={LANDING_TRIAL.href} target="_blank" rel="noreferrer">
							Записаться на занятие
						</a>
					</Button>
				</div>
			</section>

			<LandingFooter
				testIdPrefix="landing-spark"
				className="border-[#d26939]/20 bg-[#1a1a1a] [--pm-amber:#d26939]"
			/>
		</div>
	);
}

export default SparkLanding;
