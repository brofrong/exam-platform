import { XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useEffect } from "react";
import {
	TransformComponent,
	TransformWrapper,
	useControls,
} from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";

type ImageLightboxProps = {
	src: string | null;
	alt?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

function LightboxControls() {
	const { zoomIn, zoomOut, resetTransform } = useControls();

	return (
		<div className="pointer-events-auto absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-black/55 p-1 backdrop-blur-md">
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label="Уменьшить"
				className="text-white hover:bg-white/15 hover:text-white"
				data-testid="theory-image-lightbox-zoom-out"
				onClick={() => zoomOut()}
			>
				<ZoomOutIcon />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label="Увеличить"
				className="text-white hover:bg-white/15 hover:text-white"
				data-testid="theory-image-lightbox-zoom-in"
				onClick={() => zoomIn()}
			>
				<ZoomInIcon />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				aria-label="Сбросить масштаб"
				className="px-2 text-xs text-white hover:bg-white/15 hover:text-white"
				data-testid="theory-image-lightbox-reset"
				onClick={() => resetTransform()}
			>
				100%
			</Button>
		</div>
	);
}

/** Fullscreen image viewer with pinch/wheel zoom and pan. */
export function ImageLightbox({
	src,
	alt,
	open,
	onOpenChange,
}: ImageLightboxProps) {
	useEffect(() => {
		if (!open) {
			return;
		}
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="fixed inset-0 top-0 left-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black p-0 ring-0 sm:max-w-none data-open:zoom-in-100"
				data-testid="theory-image-lightbox"
				onOpenAutoFocus={(event) => event.preventDefault()}
			>
				<DialogTitle className="sr-only">Просмотр изображения</DialogTitle>
				<DialogDescription className="sr-only">
					Увеличьте изображение жестом или колёсиком мыши. Перетаскивайте, чтобы
					сдвинуть.
				</DialogDescription>

				<div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
					<span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
						Колёсико / pinch — масштаб · drag — сдвиг
					</span>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Закрыть"
						className="pointer-events-auto text-white hover:bg-white/15 hover:text-white"
						data-testid="theory-image-lightbox-close"
						onClick={() => onOpenChange(false)}
					>
						<XIcon />
					</Button>
				</div>

				{src ? (
					<TransformWrapper
						initialScale={1}
						minScale={0.5}
						maxScale={8}
						centerOnInit
						wheel={{ step: 0.12 }}
						doubleClick={{ mode: "toggle", step: 1.4 }}
						panning={{ velocityDisabled: true }}
					>
						<LightboxControls />
						<TransformComponent
							wrapperStyle={{
								width: "100vw",
								height: "100dvh",
							}}
							contentStyle={{
								width: "100vw",
								height: "100dvh",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<img
								src={src}
								alt={alt ?? ""}
								draggable={false}
								className="max-h-dvh max-w-screen object-contain select-none"
								data-testid="theory-image-lightbox-img"
							/>
						</TransformComponent>
					</TransformWrapper>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
