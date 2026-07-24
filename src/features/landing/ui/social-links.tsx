import type { LandingSocialId } from "#/features/landing/lib/socials";
import { LANDING_SOCIALS } from "#/features/landing/lib/socials";
import { cn } from "@/lib/utils";

function TelegramIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className={className}
			fill="currentColor"
		>
			<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
		</svg>
	);
}

function ProfiIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="9" />
			<path d="M10 15.5V8.5h2.4a2.5 2.5 0 0 1 0 5H10" />
		</svg>
	);
}

function VkIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className={className}
			fill="currentColor"
		>
			<path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.586-1.496c.596-.19 1.363 1.26 2.174 1.814.613.42 1.078.328 1.078.328l2.163-.03s1.13-.07.594-.958c-.044-.072-.312-.657-1.607-1.856-1.356-1.255-1.174-1.052.458-3.224.995-1.323 1.392-2.13 1.268-2.476-.118-.33-.847-.243-.847-.243l-2.433.015s-.18-.025-.314.055c-.13.078-.214.26-.214.26s-.383 1.02-.894 1.888c-1.078 1.83-1.51 1.927-1.687 1.814-.41-.264-.308-1.06-.308-1.626 0-1.768.268-2.503-.522-2.694-.263-.063-.456-.105-1.127-.112-.86-.01-1.588.003-2.001.204-.275.134-.487.432-.358.449.16.021.522.098.714.36.248.338.239 1.096.239 1.096s.142 2.065-.332 2.321c-.325.176-.771-.183-1.73-1.837-.49-.845-.86-1.78-.86-1.78s-.071-.174-.198-.268c-.154-.114-.37-.15-.37-.15l-2.312.015s-.347.01-.475.16c-.114.134-.009.41-.009.41s1.803 4.22 3.844 6.345c1.872 1.948 3.995 1.82 3.995 1.82h.963z" />
		</svg>
	);
}

function InstagramIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="3" width="18" height="18" rx="5" />
			<circle cx="12" cy="12" r="4" />
			<circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
		</svg>
	);
}

function SocialIcon({
	id,
	className,
}: {
	id: LandingSocialId;
	className?: string;
}) {
	switch (id) {
		case "telegram":
			return <TelegramIcon className={className} />;
		case "profi":
			return <ProfiIcon className={className} />;
		case "vk":
			return <VkIcon className={className} />;
		case "instagram":
			return <InstagramIcon className={className} />;
	}
}

type SocialLinksProps = {
	className?: string;
	iconClassName?: string;
	/** Compact for header; large for about/footer */
	size?: "sm" | "md" | "lg";
	showLabels?: boolean;
	"data-testid"?: string;
};

const SIZE_STYLES = {
	sm: {
		gap: "gap-1",
		button: "size-10",
		icon: "size-5",
	},
	md: {
		gap: "gap-2",
		button: "size-12",
		icon: "size-6",
	},
	lg: {
		gap: "gap-3",
		button: "size-14 sm:size-16",
		icon: "size-7 sm:size-8",
	},
} as const;

export function SocialLinks({
	className,
	iconClassName,
	size = "md",
	showLabels = false,
	"data-testid": testId,
}: SocialLinksProps) {
	const styles = SIZE_STYLES[size];

	return (
		<nav
			aria-label="Соцсети"
			data-testid={testId}
			className={cn(
				"flex flex-wrap items-center",
				styles.gap,
				showLabels && "gap-x-4 gap-y-3",
				className,
			)}
		>
			{LANDING_SOCIALS.map((social) => (
				<a
					key={social.id}
					href={social.href}
					target="_blank"
					rel="noreferrer"
					aria-label={social.label}
					title={social.label}
					className={cn(
						"inline-flex items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-[color:var(--pm-amber)]",
						showLabels ? "gap-2.5 rounded-xl px-1 py-1 pr-3" : styles.button,
						iconClassName,
					)}
				>
					<span
						className={cn(
							"inline-flex items-center justify-center rounded-full",
							showLabels && styles.button,
						)}
					>
						<SocialIcon id={social.id} className={styles.icon} />
					</span>
					{showLabels ? (
						<span className="text-sm font-medium text-white/90">
							{social.label}
						</span>
					) : null}
				</a>
			))}
		</nav>
	);
}
