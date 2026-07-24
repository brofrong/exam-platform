import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient } from "#/shared/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
	{ href: "#about", label: "Обо мне" },
	{ href: "#audience", label: "Для кого" },
	{ href: "#formats", label: "Занятия" },
	{ href: "#reviews", label: "Отзывы" },
	{ href: "#faq", label: "Вопросы" },
] as const;

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

export function LandingNav() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300",
				scrolled
					? "border-b border-white/10 bg-[color:var(--pm-navy)]/90 backdrop-blur-md"
					: "border-b border-transparent bg-gradient-to-b from-[color:var(--pm-navy)]/70 to-transparent",
			)}
		>
			<nav className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:h-[4.25rem] sm:px-6">
				<a
					href="#top"
					className="font-display text-lg font-semibold tracking-[0.04em] text-white no-underline sm:text-xl"
					data-testid="landing-brand"
				>
					PHYS&MATH
				</a>

				<div className="ml-auto hidden items-center gap-6 md:flex">
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-sm text-white/90 no-underline transition-colors hover:text-white"
						>
							{link.label}
						</a>
					))}
					<LandingAuthAction />
				</div>

				<div className="ml-auto flex items-center gap-2 md:hidden">
					<LandingAuthAction onNavigate={() => setOpen(false)} />
					<button
						type="button"
						className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white"
						aria-expanded={open}
						aria-label={open ? "Закрыть меню" : "Открыть меню"}
						onClick={() => setOpen((v) => !v)}
					>
						<span className="sr-only">Меню</span>
						<span className="flex flex-col gap-1.5">
							<span
								className={cn(
									"block h-0.5 w-5 bg-white transition",
									open && "translate-y-2 rotate-45",
								)}
							/>
							<span
								className={cn(
									"block h-0.5 w-5 bg-white transition",
									open && "opacity-0",
								)}
							/>
							<span
								className={cn(
									"block h-0.5 w-5 bg-white transition",
									open && "-translate-y-2 -rotate-45",
								)}
							/>
						</span>
					</button>
				</div>
			</nav>

			{open ? (
				<div className="border-t border-white/10 bg-[color:var(--pm-navy)] px-4 py-4 md:hidden">
					<div className="flex flex-col gap-3">
						{NAV_LINKS.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="py-2 text-base text-white/90 no-underline"
								onClick={() => setOpen(false)}
							>
								{link.label}
							</a>
						))}
					</div>
				</div>
			) : null}
		</header>
	);
}
