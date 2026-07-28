import { Link } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { LandingVersionId } from "#/features/landing/lib/variants";
import { LANDING_VERSIONS } from "#/features/landing/lib/variants";
import { SocialLinks } from "#/features/landing/ui/social-links";
import { authClient } from "#/shared/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const DEFAULT_NAV_LINKS = [
	{ href: "#about", label: "Обо мне" },
	{ href: "#audience", label: "Для кого" },
	{ href: "#formats", label: "Занятия" },
	{ href: "#reviews", label: "Отзывы" },
	{ href: "#faq", label: "Вопросы" },
] as const;

export type LandingNavLink = { href: string; label: string };

function initialsFromName(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return "?";
	}
	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}
	return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function LandingAuthAction({ onNavigate }: { onNavigate?: () => void }) {
	const { data: session, isPending } = authClient.useSession();
	const user = session?.user;

	if (isPending) {
		return (
			<div
				className="size-9 shrink-0 rounded-full bg-white/10"
				aria-hidden="true"
			/>
		);
	}

	if (user) {
		const initials = initialsFromName(user.name);
		return (
			<Link
				to="/app"
				onClick={onNavigate}
				className="inline-flex rounded-full ring-offset-2 ring-offset-[color:var(--pm-navy)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pm-amber)]"
				data-testid="landing-nav-avatar"
				aria-label="Перейти в кабинет"
			>
				<Avatar size="default" className="size-9 border border-white/20">
					{user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
					<AvatarFallback className="bg-[color:var(--pm-amber)] text-xs font-semibold text-[color:var(--pm-navy)]">
						{initials}
					</AvatarFallback>
				</Avatar>
			</Link>
		);
	}

	return (
		<Button
			asChild
			className="bg-[color:var(--pm-amber)] text-[color:var(--pm-navy)] hover:bg-[color:var(--pm-amber-bright)]"
		>
			<Link to="/login" data-testid="landing-nav-login" onClick={onNavigate}>
				Войти
			</Link>
		</Button>
	);
}

function VersionSwitcher({
	activeVersion,
	onNavigate,
	className,
}: {
	activeVersion: LandingVersionId;
	onNavigate?: () => void;
	className?: string;
}) {
	const active =
		LANDING_VERSIONS.find((v) => v.id === activeVersion) ?? LANDING_VERSIONS[0];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					"inline-flex h-9 items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 text-sm text-white/90 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[color:var(--pm-amber)]",
					className,
				)}
				data-testid="landing-version-switcher"
			>
				<span className="max-w-[7rem] truncate sm:max-w-none">
					{active.label}
				</span>
				<ChevronDown className="size-3.5 opacity-70" aria-hidden />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-52">
				{LANDING_VERSIONS.map((version) => {
					const isActive = version.id === activeVersion;
					const item = (
						<span className="flex w-full items-center justify-between gap-3">
							<span className="flex flex-col">
								<span className="font-medium">{version.label}</span>
								<span className="text-xs text-muted-foreground">
									{version.description}
								</span>
							</span>
							{isActive ? (
								<Check className="size-4 shrink-0 text-[color:var(--pm-amber-deep)]" />
							) : null}
						</span>
					);

					if (version.href === "/") {
						return (
							<DropdownMenuItem key={version.id} asChild>
								<Link
									to="/"
									onClick={onNavigate}
									data-testid={`landing-version-${version.id}`}
								>
									{item}
								</Link>
							</DropdownMenuItem>
						);
					}

					return (
						<DropdownMenuItem key={version.id} asChild>
							<Link
								to="/v/$slug"
								params={{ slug: version.slug ?? "orbit" }}
								onClick={onNavigate}
								data-testid={`landing-version-${version.id}`}
							>
								{item}
							</Link>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

type LandingNavProps = {
	activeVersion?: LandingVersionId;
	/** Solid bar from the start — for light heroes */
	solid?: boolean;
	links?: readonly LandingNavLink[];
	/** Override scrolled/solid header surface */
	barClassName?: string;
	/** Light scrapbook-style nav (cream + dark/orange text) */
	tone?: "dark" | "light";
};

export function LandingNav({
	activeVersion = "original",
	solid = false,
	links = DEFAULT_NAV_LINKS,
	barClassName,
	tone = "dark",
}: LandingNavProps) {
	const [scrolled, setScrolled] = useState(solid);
	const [open, setOpen] = useState(false);
	const isLight = tone === "light";

	useEffect(() => {
		if (solid) {
			setScrolled(true);
			return;
		}
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [solid]);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300",
				scrolled || solid
					? cn(
							isLight
								? "border-b border-[#d26939]/15 bg-[#f5efe6]/95 backdrop-blur-md"
								: "border-b border-white/10 bg-[color:var(--pm-navy)]/90 backdrop-blur-md",
							barClassName,
						)
					: isLight
						? "border-b border-transparent bg-gradient-to-b from-[#f5efe6]/90 to-transparent"
						: "border-b border-transparent bg-gradient-to-b from-[color:var(--pm-navy)]/70 to-transparent",
			)}
		>
			<nav className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:h-[4.25rem] sm:gap-4 sm:px-6">
				<SocialLinks
					size="md"
					className={cn(
						"hidden sm:flex",
						isLight &&
							"[&_a]:text-[#d26939]/85 [&_a:hover]:bg-[#d26939]/10 [&_a:hover]:text-[#d26939]",
					)}
					data-testid="landing-nav-socials"
				/>

				<a
					href="#top"
					className={cn(
						"font-display text-lg font-semibold tracking-[0.04em] no-underline sm:text-xl",
						isLight ? "text-[#d26939]" : "text-white",
					)}
					data-testid="landing-brand"
				>
					PHYS&MATH
				</a>

				<div className="ml-auto hidden items-center gap-5 lg:flex">
					{links.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className={cn(
								"text-sm no-underline transition-colors",
								isLight
									? "text-[#d26939]/85 hover:text-[#d26939]"
									: "text-white/90 hover:text-white",
							)}
						>
							{link.label}
						</a>
					))}
					<VersionSwitcher
						activeVersion={activeVersion}
						className={
							isLight
								? "border-[#d26939]/30 bg-[#d26939]/5 text-[#1a1a1a] hover:bg-[#d26939]/10 hover:text-[#1a1a1a]"
								: undefined
						}
					/>
					<LandingAuthAction />
				</div>

				<div className="ml-auto flex items-center gap-2 lg:hidden">
					<VersionSwitcher
						activeVersion={activeVersion}
						onNavigate={() => setOpen(false)}
						className={cn(
							"hidden sm:inline-flex",
							isLight &&
								"border-[#d26939]/30 bg-[#d26939]/5 text-[#1a1a1a] hover:bg-[#d26939]/10 hover:text-[#1a1a1a]",
						)}
					/>
					<LandingAuthAction onNavigate={() => setOpen(false)} />
					<button
						type="button"
						className={cn(
							"inline-flex h-10 w-10 items-center justify-center rounded-md",
							isLight ? "text-[#1a1a1a]" : "text-white",
						)}
						aria-expanded={open}
						aria-label={open ? "Закрыть меню" : "Открыть меню"}
						onClick={() => setOpen((v) => !v)}
					>
						<span className="sr-only">Меню</span>
						<span className="flex flex-col gap-1.5">
							<span
								className={cn(
									"block h-0.5 w-5 transition",
									isLight ? "bg-[#1a1a1a]" : "bg-white",
									open && "translate-y-2 rotate-45",
								)}
							/>
							<span
								className={cn(
									"block h-0.5 w-5 transition",
									isLight ? "bg-[#1a1a1a]" : "bg-white",
									open && "opacity-0",
								)}
							/>
							<span
								className={cn(
									"block h-0.5 w-5 transition",
									isLight ? "bg-[#1a1a1a]" : "bg-white",
									open && "-translate-y-2 -rotate-45",
								)}
							/>
						</span>
					</button>
				</div>
			</nav>

			{open ? (
				<div
					className={cn(
						"border-t px-4 py-4 lg:hidden",
						isLight
							? "border-[#d26939]/15 bg-[#f5efe6]"
							: "border-white/10 bg-[color:var(--pm-navy)]",
						barClassName,
					)}
				>
					<div className="flex flex-col gap-3">
						{links.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className={cn(
									"py-2 text-base no-underline",
									isLight ? "text-[#1a1a1a]/85" : "text-white/90",
								)}
								onClick={() => setOpen(false)}
							>
								{link.label}
							</a>
						))}
						<div className="pt-1 sm:hidden">
							<p
								className={cn(
									"mb-2 text-xs tracking-wide uppercase",
									isLight ? "text-[#1a1a1a]/45" : "text-white/50",
								)}
							>
								Версия лендинга
							</p>
							<VersionSwitcher
								activeVersion={activeVersion}
								onNavigate={() => setOpen(false)}
								className={cn(
									"w-full justify-between",
									isLight &&
										"border-[#d26939]/30 bg-[#d26939]/5 text-[#1a1a1a]",
								)}
							/>
						</div>
						<SocialLinks
							size="lg"
							className={cn(
								"pt-2",
								isLight &&
									"[&_a]:text-[#d26939]/85 [&_a:hover]:bg-[#d26939]/10 [&_a:hover]:text-[#d26939]",
							)}
							data-testid="landing-nav-socials-mobile"
						/>
					</div>
				</div>
			) : null}
		</header>
	);
}
