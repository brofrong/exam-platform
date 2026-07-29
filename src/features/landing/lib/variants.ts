import type { ComponentType } from "react";
import { AtelierLanding } from "#/features/landing/ui/variants/atelier-landing";
import { BloomLanding } from "#/features/landing/ui/variants/bloom-landing";
import { ChalkLanding } from "#/features/landing/ui/variants/chalk-landing";
import { NeonLanding } from "#/features/landing/ui/variants/neon-landing";
import { NotebookLanding } from "#/features/landing/ui/variants/notebook-landing";
import { OrbitLanding } from "#/features/landing/ui/variants/orbit-landing";
import { ProofLanding } from "#/features/landing/ui/variants/proof-landing";
import { PulseLanding } from "#/features/landing/ui/variants/pulse-landing";
import { SparkLanding } from "#/features/landing/ui/variants/spark-landing";
import { StoryLanding } from "#/features/landing/ui/variants/story-landing";
import { TrajectoryLanding } from "#/features/landing/ui/variants/trajectory-landing";

export const LANDING_VARIANT_SLUGS = [
	"orbit",
	"atelier",
	"proof",
	"chalk",
	"story",
	"spark",
	"neon",
	"bloom",
	"trajectory",
	"notebook",
	"pulse",
] as const;

export type LandingVariantSlug = (typeof LANDING_VARIANT_SLUGS)[number];

export type LandingVersionId = "original" | LandingVariantSlug;

export type LandingVersionMeta = {
	id: LandingVersionId;
	label: string;
	description: string;
	href: "/" | "/v/$slug";
	slug?: LandingVariantSlug;
};

export const LANDING_VERSIONS: readonly LandingVersionMeta[] = [
	{
		id: "original",
		label: "Оригинал",
		description: "Текущий navy + amber",
		href: "/",
	},
	{
		id: "orbit",
		label: "Orbit",
		description: "Табло баллов",
		href: "/v/$slug",
		slug: "orbit",
	},
	{
		id: "atelier",
		label: "Atelier",
		description: "Фото-эссе",
		href: "/v/$slug",
		slug: "atelier",
	},
	{
		id: "proof",
		label: "Proof",
		description: "Отчёт для родителей",
		href: "/v/$slug",
		slug: "proof",
	},
	{
		id: "chalk",
		label: "Chalk",
		description: "STEM-геометрия",
		href: "/v/$slug",
		slug: "chalk",
	},
	{
		id: "story",
		label: "Story",
		description: "Журнальная история",
		href: "/v/$slug",
		slug: "story",
	},
	{
		id: "spark",
		label: "Spark",
		description: "Scrapbook / SPEAKY",
		href: "/v/$slug",
		slug: "spark",
	},
	{
		id: "neon",
		label: "Neon",
		description: "Тёмный HUD-кокпит",
		href: "/v/$slug",
		slug: "neon",
	},
	{
		id: "bloom",
		label: "Bloom",
		description: "Светлая пастель + анимации",
		href: "/v/$slug",
		slug: "bloom",
	},
	{
		id: "trajectory",
		label: "Trajectory",
		description: "Живая физика на canvas",
		href: "/v/$slug",
		slug: "trajectory",
	},
	{
		id: "notebook",
		label: "Notebook",
		description: "Живая тетрадь + дневник",
		href: "/v/$slug",
		slug: "notebook",
	},
	{
		id: "pulse",
		label: "Pulse",
		description: "Spring-физика на motion",
		href: "/v/$slug",
		slug: "pulse",
	},
] as const;

export const LANDING_VARIANT_PAGES: Record<LandingVariantSlug, ComponentType> =
	{
		orbit: OrbitLanding,
		atelier: AtelierLanding,
		proof: ProofLanding,
		chalk: ChalkLanding,
		story: StoryLanding,
		spark: SparkLanding,
		neon: NeonLanding,
		bloom: BloomLanding,
		trajectory: TrajectoryLanding,
		notebook: NotebookLanding,
		pulse: PulseLanding,
	};

export function isLandingVariantSlug(
	value: string,
): value is LandingVariantSlug {
	return (LANDING_VARIANT_SLUGS as readonly string[]).includes(value);
}
