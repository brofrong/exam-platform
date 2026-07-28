import {
	LANDING_BRAND,
	LANDING_FORMATS,
	LANDING_IMAGES,
	LANDING_TRIAL,
} from "#/features/landing/lib/content";
import { LANDING_REVIEWS } from "#/features/landing/lib/reviews";
import { LandingFooter } from "#/features/landing/ui/landing-footer";
import { LandingNav } from "#/features/landing/ui/landing-nav";
import { Button } from "@/components/ui/button";

const NAV = [
	{ href: "#frames", label: "Кадры" },
	{ href: "#formats", label: "Занятия" },
	{ href: "#victoria", label: "Виктория" },
	{ href: "#notes", label: "Отзывы" },
	{ href: "#trial", label: "Урок" },
] as const;

const FRAMES = [
	{
		src: LANDING_IMAGES.hero,
		caption: "У доски — там, где формулы перестают пугать",
		object: "object-[center_18%]",
	},
	{
		src: LANDING_IMAGES.whiteboard,
		caption: "Живой разбор: не слайды ради слайдов",
		object: "object-center",
	},
	{
		src: LANDING_IMAGES.desk,
		caption: "Спокойный темп. Твоя скорость — ок",
		object: "object-[center_30%]",
	},
] as const;

/**
 * Atelier — photo essay.
 * Full-bleed frames, short captions, almost no cards. Charcoal + warm sand.
 */
export function AtelierLanding() {
	return (
		<div
			className="landing landing-atelier light"
			data-testid="landing-page-atelier"
			id="top"
		>
			<LandingNav
				activeVersion="atelier"
				links={NAV}
				barClassName="border-white/10 bg-[#1a1814]/92"
			/>

			{/* Hero — brand over full bleed, minimal copy */}
			<section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-16 pt-28 sm:pb-24">
				<img
					src={LANDING_IMAGES.portrait}
					alt=""
					className="landing-hero-image absolute inset-0 h-full w-full object-cover object-[center_15%]"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-[#1a1814] via-[#1a1814]/40 to-transparent" />
				<div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
					<p className="landing-fade font-display text-5xl font-semibold tracking-[0.08em] text-white sm:text-7xl md:text-8xl">
						{LANDING_BRAND}
					</p>
					<h1 className="landing-fade landing-fade-delay-1 mt-6 max-w-lg text-2xl font-medium leading-snug text-white/90 sm:text-3xl">
						Математика и физика без театра гениальности
					</h1>
					<p className="landing-fade landing-fade-delay-2 mt-4 max-w-md text-white/65">
						Просто занятия, которые наконец складываются в балл.
					</p>
					<div className="landing-fade landing-fade-delay-3 mt-8">
						<Button
							asChild
							size="lg"
							className="rounded-full bg-[#e8dcc8] px-8 text-[#1a1814] hover:bg-white"
						>
							<a href="#trial" data-testid="landing-hero-cta">
								Хочу попробовать
							</a>
						</Button>
					</div>
				</div>
			</section>

			{/* Photo essay frames */}
			<section id="frames" className="scroll-mt-20 bg-[#1a1814]">
				{FRAMES.map((frame) => (
					<figure
						key={frame.src}
						className="relative isolate min-h-[70svh] overflow-hidden sm:min-h-[85svh]"
					>
						<img
							src={frame.src}
							alt=""
							className={`absolute inset-0 h-full w-full object-cover ${frame.object}`}
						/>
						<div className="absolute inset-0 bg-[#1a1814]/25" />
						<figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
							<p className="mx-auto max-w-6xl font-display text-xl text-white sm:text-3xl">
								{frame.caption}
							</p>
						</figcaption>
					</figure>
				))}
			</section>

			{/* Formats — text only on sand */}
			<section
				id="formats"
				className="scroll-mt-20 bg-[#e8dcc8] py-24 text-[#1a1814] sm:py-32"
			>
				<div className="mx-auto max-w-2xl px-4 sm:px-6">
					<p className="text-sm tracking-[0.2em] uppercase opacity-50">
						Как занимаемся
					</p>
					<h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
						Без прайс-карточек. Три формата — словами.
					</h2>
					<ul className="mt-16 space-y-12">
						{LANDING_FORMATS.map((format) => (
							<li key={format.id} id={format.id}>
								<h3 className="font-display text-2xl font-semibold">
									{format.title}
								</h3>
								<p className="mt-2 text-sm tracking-wide uppercase opacity-50">
									{format.highlight} — {format.highlightHint}
								</p>
								<p className="mt-4 text-lg leading-relaxed opacity-80">
									{format.lead}
								</p>
								<a
									href="#trial"
									className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
								>
									{format.cta}
								</a>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Victoria — split */}
			<section
				id="victoria"
				className="scroll-mt-20 grid bg-[#1a1814] text-[#e8dcc8] lg:grid-cols-2"
			>
				<img
					src={LANDING_IMAGES.about}
					alt="Виктория"
					className="aspect-[4/5] h-full w-full object-cover lg:aspect-auto lg:min-h-[36rem]"
				/>
				<div className="flex flex-col justify-center px-6 py-16 sm:px-12 sm:py-24">
					<p className="text-sm tracking-[0.25em] uppercase opacity-50">
						Преподаватель
					</p>
					<h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
						Виктория
					</h2>
					<p className="mt-8 max-w-md text-lg leading-relaxed text-[#e8dcc8]/75">
						Три высших. Эксперт ЕГЭ. Не «разжёвываю учебник» — собираю понятный
						путь от твоей текущей точки до нужного балла.
					</p>
					<p className="mt-6 font-display text-sm tracking-wide text-[#e8dcc8]/50">
						10 лет · 200+ учеников · 95+ сама, трижды
					</p>
				</div>
			</section>

			{/* Notes — pull quotes on sand */}
			<section
				id="notes"
				className="scroll-mt-20 bg-[#e8dcc8] py-24 text-[#1a1814] sm:py-32"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<h2 className="font-display text-3xl font-semibold sm:text-4xl">
						Заметки с занятий
					</h2>
					<div className="mt-14 space-y-16">
						{LANDING_REVIEWS.slice(0, 3).map((review) => (
							<blockquote key={review.id}>
								<p className="font-display text-2xl leading-snug sm:text-3xl">
									«{review.quote}»
								</p>
								<footer className="mt-4 text-sm opacity-50">
									— {review.name}, {review.meta}
								</footer>
							</blockquote>
						))}
					</div>
				</div>
			</section>

			<section
				id="trial"
				className="scroll-mt-20 bg-[#1a1814] py-28 text-center text-[#e8dcc8] sm:py-36"
			>
				<div className="mx-auto max-w-xl px-4">
					<h2 className="font-display text-4xl font-semibold sm:text-5xl">
						Один урок — чтобы почувствовать тон
					</h2>
					<p className="mt-6 text-[#e8dcc8]/65">{LANDING_TRIAL.body}</p>
					<Button
						asChild
						size="lg"
						className="mt-10 rounded-full bg-[#e8dcc8] px-10 text-[#1a1814] hover:bg-white"
					>
						<a
							href={LANDING_TRIAL.href}
							target="_blank"
							rel="noreferrer"
							data-testid="landing-trial-cta"
						>
							Написать Виктории
						</a>
					</Button>
				</div>
			</section>

			<LandingFooter
				testIdPrefix="landing-atelier"
				className="border-white/10 bg-[#12100e] [--pm-amber:#e8dcc8]"
			/>
		</div>
	);
}

export default AtelierLanding;
