import { cn } from "@/lib/utils";

/** Shared prose classes for TheoryEditor and TheoryRenderer. */
export function theoryProseClassName(...extra: Array<string | undefined>) {
	return cn(
		"text-sm leading-relaxed focus:outline-none",
		"[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold",
		"[&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold",
		"[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:font-medium",
		"[&_p]:my-1.5",
		"[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
		"[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
		"[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic",
		"[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em]",
		"[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3",
		"[&_pre_code]:bg-transparent [&_pre_code]:p-0",
		"[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
		"[&_mark]:rounded-sm [&_mark]:px-0.5 [&_mark]:box-decoration-clone",
		"[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
		"[&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-medium",
		"[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5",
		"[&_.tableWrapper]:my-3 [&_.tableWrapper]:overflow-x-auto",
		"[&_[data-resize-container][data-node=image]]:mx-1 [&_[data-resize-container][data-node=image]]:my-0 [&_[data-resize-container][data-node=image]]:inline-flex [&_[data-resize-container][data-node=image]]:align-middle [&_[data-resize-container][data-node=image]]:max-w-full",
		"[&_img.theory-image]:inline-block [&_img.theory-image]:h-auto [&_img.theory-image]:max-w-full [&_img.theory-image]:rounded-lg [&_img.theory-image]:align-middle",
		"[&_.is-empty::before]:pointer-events-none [&_.is-empty::before]:float-left [&_.is-empty::before]:h-0 [&_.is-empty::before]:text-muted-foreground [&_.is-empty::before]:content-[attr(data-placeholder)]",
		...extra,
	);
}
