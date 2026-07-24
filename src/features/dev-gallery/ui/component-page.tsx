import { Link } from "@tanstack/react-router";
import { getGalleryEntry } from "#/features/dev-gallery/lib/registry";
import { Button } from "@/components/ui/button";

type ComponentPageProps = {
	slug: string;
};

export function ComponentPage({ slug }: ComponentPageProps) {
	const entry = getGalleryEntry(slug);

	if (!entry) {
		return (
			<div className="space-y-4 py-10" data-testid="dev-gallery-empty">
				<h1 className="text-2xl font-semibold tracking-tight">
					Component not found
				</h1>
				<p className="text-muted-foreground">
					No gallery entry matches{" "}
					<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{slug}</code>
					.
				</p>
				<Button asChild variant="outline">
					<Link to="/dev">Back to gallery</Link>
				</Button>
			</div>
		);
	}

	const Preview = entry.component;

	return (
		<article className="space-y-6">
			<header className="space-y-2 border-b border-border pb-6">
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					{entry.category}
				</p>
				<h1 className="text-3xl font-semibold tracking-tight">{entry.title}</h1>
				<p className="max-w-2xl text-muted-foreground">{entry.description}</p>
			</header>

			<section className="space-y-3">
				<h2 className="text-sm font-medium text-muted-foreground">Preview</h2>
				<div
					className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-card p-6 sm:p-8"
					data-testid="dev-gallery-preview"
				>
					<Preview />
				</div>
			</section>

			{entry.note ? (
				<section className="space-y-2">
					<h2 className="text-sm font-medium text-muted-foreground">Note</h2>
					<pre className="overflow-x-auto rounded-lg bg-muted px-3 py-2 text-xs text-foreground">
						{entry.note}
					</pre>
				</section>
			) : null}
		</article>
	);
}
