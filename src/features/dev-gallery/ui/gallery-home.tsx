import { Link } from "@tanstack/react-router";
import { getEntriesByCategory } from "#/features/dev-gallery/lib/registry";
import { DevGalleryLayout } from "#/features/dev-gallery/ui/dev-gallery-layout";

export function GalleryHome() {
	const groups = getEntriesByCategory();

	return (
		<DevGalleryLayout>
			<div className="space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Component gallery
					</h1>
					<p className="max-w-2xl text-muted-foreground">
						Browse shadcn primitives and LMS composites. Open an entry for a
						live preview.
					</p>
				</header>

				{groups.map(({ category, entries }) => (
					<section key={category} className="space-y-3">
						<h2 className="text-lg font-medium tracking-tight">{category}</h2>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{entries.map((entry) => (
								<Link
									key={entry.slug}
									to="/dev/$slug"
									params={{ slug: entry.slug }}
									className="block rounded-xl border border-border bg-card p-4 text-foreground no-underline transition-colors hover:bg-muted/40"
									data-testid={`dev-card-${entry.slug}`}
								>
									<p className="font-medium">{entry.title}</p>
									<p className="mt-1 text-sm text-muted-foreground">
										{entry.description}
									</p>
								</Link>
							))}
						</div>
					</section>
				))}
			</div>
		</DevGalleryLayout>
	);
}
