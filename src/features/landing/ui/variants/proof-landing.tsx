import {
	LANDING_BRAND,
	LANDING_FAQ,
	LANDING_FORMATS,
	LANDING_IMAGES,
	LANDING_STATS,
	LANDING_TRIAL,
} from "#/features/landing/lib/content";
import { LandingFooter } from "#/features/landing/ui/landing-footer";
import { LandingNav } from "#/features/landing/ui/landing-nav";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const NAV = [
	{ href: "#evidence", label: "Доказательства" },
	{ href: "#compare", label: "До / После" },
	{ href: "#faq", label: "Сомнения" },
	{ href: "#offer", label: "Форматы" },
	{ href: "#trial", label: "Запись" },
] as const;

const COMPARE = [
	{
		before: "«Не понимаю, с чего начать»",
		after: "План на месяц и понятная первая тема",
	},
	{
		before: "Школьные 3–4 и паника перед ОГЭ",
		after: "Стабильная «5» / нужный порог без надрыва",
	},
	{
		before: "Первая часть ок, вторая — провал",
		after: "Системная тренировка 13–19 под 80–90+",
	},
] as const;

/**
 * Proof — parent lab report.
 * Stark white + ink + blood-orange. Evidence first, FAQ before offer.
 */
export function ProofLanding() {
	return (
		<div
			className="landing landing-proof light"
			data-testid="landing-page-proof"
			id="top"
		>
			<LandingNav
				activeVersion="proof"
				solid
				links={NAV}
				barClassName="border-[#1a1a1a] bg-[#111]/95"
			/>

			{/* Minimal report header */}
			<section className="bg-[#fafafa] pb-12 pt-28 text-[#111] sm:pb-16 sm:pt-32">
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#111] pb-6">
						<div>
							<p className="font-mono text-[11px] tracking-[0.25em] text-[#c45c26] uppercase">
								Отчёт · {LANDING_BRAND}
							</p>
							<h1 className="landing-fade mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-5xl">
								Родителям: что именно меняется у ребёнка
							</h1>
						</div>
						<p className="landing-fade landing-fade-delay-1 max-w-xs text-sm text-[#111]/55">
							Без маркетинговых обещаний. Цифры, документы, честные ответы.
						</p>
					</div>
					<div className="landing-fade landing-fade-delay-2 mt-8 flex flex-wrap gap-3">
						<Button
							asChild
							size="lg"
							className="rounded-none bg-[#c45c26] px-6 text-white hover:bg-[#a84a1c]"
						>
							<a href="#trial" data-testid="landing-hero-cta">
								Записаться на диагностику
							</a>
						</Button>
						<a
							href="#evidence"
							className="inline-flex items-center font-mono text-xs tracking-wide text-[#111] underline underline-offset-4"
						>
							К доказательствам
						</a>
					</div>
				</div>
			</section>

			{/* Evidence wall — diplomas FIRST */}
			<section
				id="evidence"
				className="scroll-mt-20 border-b border-[#111]/10 bg-white py-16 sm:py-20"
			>
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<div className="flex flex-wrap items-baseline justify-between gap-2">
						<h2 className="font-display text-2xl font-semibold text-[#111] sm:text-3xl">
							01 · Документы
						</h2>
						<p className="font-mono text-xs text-[#111]/45">
							Дипломы и сертификаты преподавателя
						</p>
					</div>
					<div className="landing-diplom-masonry mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
						{LANDING_IMAGES.diploms.map((src, i) => (
							<img
								key={src}
								src={src}
								alt={`Документ ${i + 1}`}
								className={`w-full object-cover ring-1 ring-[#111]/10 ${
									i === 0
										? "col-span-2 aspect-[16/10] sm:col-span-1 sm:row-span-2 sm:aspect-auto sm:h-full"
										: "aspect-[4/3]"
								}`}
							/>
						))}
					</div>
					<div className="mt-12 grid grid-cols-2 gap-6 border-t border-[#111]/10 pt-10 sm:grid-cols-4">
						{LANDING_STATS.map((stat) => (
							<div key={stat.value}>
								<p className="font-display text-3xl font-semibold text-[#111] sm:text-4xl">
									{stat.value}
								</p>
								<p className="mt-1 font-mono text-[11px] tracking-wide text-[#111]/50 uppercase">
									{stat.label}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Before / After table */}
			<section
				id="compare"
				className="scroll-mt-20 bg-[#fafafa] py-16 text-[#111] sm:py-20"
			>
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<h2 className="font-display text-2xl font-semibold sm:text-3xl">
						02 · До / После
					</h2>
					<div className="mt-10 overflow-hidden border border-[#111]">
						<div className="grid grid-cols-2 bg-[#111] font-mono text-[11px] tracking-wide text-white uppercase">
							<div className="border-r border-white/20 px-4 py-3">Было</div>
							<div className="px-4 py-3 text-[#c45c26]">Стало</div>
						</div>
						{COMPARE.map((row) => (
							<div
								key={row.before}
								className="grid grid-cols-2 border-t border-[#111]/15 text-sm sm:text-base"
							>
								<div className="border-r border-[#111]/15 bg-white px-4 py-5 text-[#111]/55">
									{row.before}
								</div>
								<div className="bg-white px-4 py-5 font-medium">
									{row.after}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ early — objections */}
			<section
				id="faq"
				className="scroll-mt-20 bg-white py-16 text-[#111] sm:py-20"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<h2 className="font-display text-2xl font-semibold sm:text-3xl">
						03 · Частые сомнения
					</h2>
					<p className="mt-3 text-sm text-[#111]/55">
						Ответы до того, как смотреть форматы — чтобы не осталось «а вдруг».
					</p>
					<Accordion type="single" collapsible className="mt-8 w-full">
						{LANDING_FAQ.map((item) => (
							<AccordionItem
								key={item.q}
								value={item.q}
								className="border-[#111]/15"
							>
								<AccordionTrigger className="text-left text-base font-medium">
									{item.q}
								</AccordionTrigger>
								<AccordionContent className="text-[#111]/65">
									{item.a}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>

			{/* Teacher strip */}
			<section className="border-y border-[#111]/10 bg-[#fafafa] py-12">
				<div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 sm:flex-row sm:px-6">
					<img
						src={LANDING_IMAGES.portrait2}
						alt="Виктория"
						className="size-28 shrink-0 rounded-full object-cover ring-2 ring-[#111]/10 sm:size-32"
					/>
					<div className="text-center sm:text-left">
						<p className="font-mono text-[11px] tracking-[0.2em] text-[#c45c26] uppercase">
							Преподаватель
						</p>
						<h2 className="mt-1 font-display text-2xl font-semibold text-[#111]">
							Скачкова Виктория Олеговна
						</h2>
						<p className="mt-3 max-w-xl text-sm text-[#111]/65">
							Эксперт ЕГЭ по профильной математике. Готовлю к ОГЭ и ЕГЭ по
							математике и физике — индивидуально, в группах и через марафоны на
							платформе.
						</p>
					</div>
				</div>
			</section>

			{/* Offer last */}
			<section
				id="offer"
				className="scroll-mt-20 bg-white py-16 text-[#111] sm:py-20"
			>
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<h2 className="font-display text-2xl font-semibold sm:text-3xl">
						04 · Форматы работы
					</h2>
					<div className="mt-10 grid gap-0 border border-[#111] md:grid-cols-3 md:items-stretch">
						{LANDING_FORMATS.map((format, i) => (
							<article
								key={format.id}
								id={format.id}
								className={`flex flex-col p-6 ${i < LANDING_FORMATS.length - 1 ? "border-b border-[#111] md:border-r md:border-b-0" : ""} ${format.featured ? "bg-[#fff7f2]" : "bg-white"}`}
							>
								{format.featured ? (
									<p className="font-mono text-[10px] tracking-wide text-[#c45c26] uppercase">
										Чаще выбирают
									</p>
								) : (
									<p className="font-mono text-[10px] tracking-wide text-[#111]/35 uppercase">
										Вариант
									</p>
								)}
								<h3 className="mt-2 font-display text-xl font-semibold">
									{format.title}
								</h3>
								<p className="mt-1 text-2xl font-semibold text-[#c45c26]">
									{format.highlight}
								</p>
								<p className="mt-3 text-sm text-[#111]/65">{format.why}</p>
								<a
									href="#trial"
									className="mt-auto inline-block pt-5 font-mono text-xs tracking-wide underline underline-offset-4"
								>
									{format.cta}
								</a>
							</article>
						))}
					</div>
				</div>
			</section>

			<section
				id="trial"
				className="scroll-mt-20 bg-[#111] py-20 text-center text-white sm:py-28"
			>
				<div className="mx-auto max-w-2xl px-4">
					<p className="font-mono text-[11px] tracking-[0.25em] text-[#c45c26] uppercase">
						Следующий шаг
					</p>
					<h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
						Бесплатная 30-минутная диагностика
					</h2>
					<p className="mt-4 text-white/65">
						Разберём текущий уровень, цель и формат. Решение — только после
						разговора.
					</p>
					<Button
						asChild
						size="lg"
						className="mt-8 rounded-none bg-[#c45c26] px-10 text-white hover:bg-[#a84a1c]"
					>
						<a
							href={LANDING_TRIAL.href}
							target="_blank"
							rel="noreferrer"
							data-testid="landing-trial-cta"
						>
							Написать в Telegram
						</a>
					</Button>
				</div>
			</section>

			<LandingFooter
				testIdPrefix="landing-proof"
				className="border-white/10 bg-[#0a0a0a] [--pm-amber:#c45c26]"
			/>
		</div>
	);
}

export default ProofLanding;
