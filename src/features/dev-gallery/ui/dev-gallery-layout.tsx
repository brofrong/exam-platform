import { Link, useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
	galleryRegistry,
	getEntriesByCategory,
} from "#/features/dev-gallery/lib/registry";
import { cn } from "@/lib/utils";

type DevGalleryLayoutProps = {
	children: ReactNode;
};

export function DevGalleryLayout({ children }: DevGalleryLayoutProps) {
	const params = useParams({ strict: false });
	const activeSlug = typeof params.slug === "string" ? params.slug : undefined;
	const groups = getEntriesByCategory();

	return (
		<div
			className="mx-auto flex h-[calc(100dvh-4.5rem)] w-full max-w-7xl gap-8 px-4"
			data-testid="dev-gallery"
		>
			<aside className="hidden w-56 shrink-0 overflow-y-auto py-6 md:block">
				<div className="space-y-6">
					<div>
						<Link
							to="/dev"
							className="text-sm font-semibold text-foreground no-underline hover:underline"
						>
							Components
						</Link>
						<p className="mt-1 text-xs text-muted-foreground">
							{galleryRegistry.length} entries
						</p>
					</div>
					<nav className="space-y-5" aria-label="Component gallery">
						{groups.map(({ category, entries }) => (
							<div key={category} className="space-y-1.5">
								<p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
									{category}
								</p>
								<ul className="space-y-0.5">
									{entries.map((entry) => {
										const active = entry.slug === activeSlug;
										return (
											<li key={entry.slug}>
												<Link
													to="/dev/$slug"
													params={{ slug: entry.slug }}
													data-testid={`dev-nav-item-${entry.slug}`}
													className={cn(
														"block rounded-md px-2 py-1.5 text-sm no-underline transition-colors",
														active
															? "bg-muted font-medium text-foreground"
															: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
													)}
												>
													{entry.title}
												</Link>
											</li>
										);
									})}
								</ul>
							</div>
						))}
					</nav>
				</div>
			</aside>
			<div
				key={activeSlug ?? "home"}
				className="min-w-0 flex-1 overflow-y-auto py-6"
			>
				{children}
			</div>
		</div>
	);
}
