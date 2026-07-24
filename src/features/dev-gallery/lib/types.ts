import type { ComponentType, ReactNode } from "react";

export const GALLERY_CATEGORIES = [
	"Foundations",
	"Forms",
	"Feedback",
	"Navigation",
	"Data display",
	"LMS composites",
	"Editor",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export type GalleryEntry = {
	slug: string;
	title: string;
	description: string;
	category: GalleryCategory;
	component: ComponentType;
	note?: ReactNode;
};
