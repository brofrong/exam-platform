/** Publish lifecycle for program / topic / lesson. */
export const PUBLISH_STATUSES = ["draft", "published"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

/** Activity kinds stored on `activity.type`. */
export const ACTIVITY_TYPES = ["theory", "practice"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Empty TipTap document used when creating an activity without content. */
export const EMPTY_TIPTAP_DOC: Record<string, unknown> = {
	type: "doc",
	content: [],
};
