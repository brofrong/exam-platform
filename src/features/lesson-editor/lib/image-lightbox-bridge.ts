export type ImageLightboxRequest = {
	src: string;
	alt?: string;
};

type Handler = (request: ImageLightboxRequest) => void;

let handler: Handler | null = null;

/** Bind the active TheoryRenderer lightbox opener (NodeViews use a separate React root). */
export function bindImageLightbox(next: Handler | null): void {
	handler = next;
}

export function requestImageLightbox(request: ImageLightboxRequest): void {
	handler?.(request);
}
