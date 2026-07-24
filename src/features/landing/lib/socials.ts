export type LandingSocialId = "telegram" | "vk" | "instagram" | "profi";

export type LandingSocial = {
	id: LandingSocialId;
	label: string;
	href: string;
};

/** Public contact links shown in nav, about, and footer */
export const LANDING_SOCIALS: LandingSocial[] = [
	{
		id: "telegram",
		label: "Telegram",
		href: "https://t.me/math_physics_2020",
	},
	{
		id: "vk",
		label: "ВКонтакте",
		href: "https://vk.ru/math_physics_2020",
	},
	{
		id: "instagram",
		label: "Instagram",
		href: "https://www.instagram.com/math_physics_2020/",
	},
	{
		id: "profi",
		label: "Profi.ru",
		href: "https://profi.ru/profile/BikovetsVO",
	},
];
