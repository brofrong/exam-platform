import { cn } from "@/lib/utils";

type VideoEmbedFrameProps = {
	embedUrl: string;
	title?: string;
	className?: string;
};

function VideoEmbedFrame({
	embedUrl,
	title = "Видео",
	className,
}: VideoEmbedFrameProps) {
	return (
		<div
			data-slot="video-embed-frame"
			className={cn(
				"overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10",
				className,
			)}
		>
			<iframe
				src={embedUrl}
				title={title}
				className="aspect-video w-full border-0"
				loading="lazy"
				referrerPolicy="strict-origin-when-cross-origin"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen
				sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
				data-testid="video-embed-frame"
			/>
		</div>
	);
}

export { VideoEmbedFrame };
export type { VideoEmbedFrameProps };
