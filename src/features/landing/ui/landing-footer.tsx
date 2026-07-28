import { Link } from "@tanstack/react-router";
import {
	LANDING_BRAND,
	LANDING_FOOTER,
	LANDING_TRIAL,
} from "#/features/landing/lib/content";
import { SocialLinks } from "#/features/landing/ui/social-links";
import { cn } from "@/lib/utils";

type LandingFooterProps = {
	className?: string;
	testIdPrefix?: string;
};

export function LandingFooter({
	className,
	testIdPrefix = "landing",
}: LandingFooterProps) {
	return (
		<footer
			className={cn(
				"border-t border-white/10 bg-[color:var(--pm-navy)] py-14 text-white",
				className,
			)}
		>
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
				<div>
					<p className="font-display text-2xl font-semibold tracking-[0.06em]">
						{LANDING_BRAND}
					</p>
					<p className="mt-3 max-w-sm text-sm text-white/60">
						{LANDING_FOOTER.legal}
					</p>
					<SocialLinks
						size="lg"
						className="mt-5"
						data-testid={`${testIdPrefix}-footer-socials`}
					/>
				</div>
				<div className="flex flex-col gap-2 text-sm">
					<a
						href={LANDING_TRIAL.href}
						target="_blank"
						rel="noreferrer"
						className="text-white/80 no-underline hover:text-[color:var(--pm-amber)]"
					>
						{LANDING_FOOTER.telegramLabel}
					</a>
					<Link
						to="/login"
						className="text-white/80 no-underline hover:text-[color:var(--pm-amber)]"
					>
						{LANDING_FOOTER.loginLabel}
					</Link>
				</div>
			</div>
		</footer>
	);
}
