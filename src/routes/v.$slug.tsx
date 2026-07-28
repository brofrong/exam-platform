import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
	isLandingVariantSlug,
	LANDING_VARIANT_PAGES,
} from "#/features/landing/lib/variants";

export const Route = createFileRoute("/v/$slug")({
	component: LandingVariantPage,
	notFoundComponent: LandingVariantNotFound,
});

function LandingVariantPage() {
	const { slug } = Route.useParams();
	if (!isLandingVariantSlug(slug)) {
		throw notFound();
	}
	const Page = LANDING_VARIANT_PAGES[slug];
	return <Page />;
}

function LandingVariantNotFound() {
	return (
		<main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="text-xl font-semibold">Такой версии лендинга нет</h1>
			<p className="text-sm text-muted-foreground">
				Выбери вариант в меню или вернись на главную.
			</p>
			<Link to="/" className="text-sm underline underline-offset-4">
				На главную
			</Link>
		</main>
	);
}
