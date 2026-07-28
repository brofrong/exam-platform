import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ThemeMode = "light" | "dark" | "auto";

const THEME_STORAGE_KEY = "theme";
const MODES: ThemeMode[] = ["auto", "light", "dark"];

export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
	auto: "Системная",
	light: "Светлая",
	dark: "Тёмная",
};

export function getStoredTheme(): ThemeMode {
	if (typeof window === "undefined") {
		return "auto";
	}

	const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored;
	}

	return "auto";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
	if (mode === "auto") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}

	return mode;
}

export function applyTheme(mode: ThemeMode) {
	const root = document.documentElement;
	const resolved = resolveTheme(mode);

	root.classList.remove("light", "dark");
	root.classList.add(resolved);

	if (mode === "auto") {
		root.removeAttribute("data-theme");
	} else {
		root.setAttribute("data-theme", mode);
	}

	root.style.colorScheme = resolved;
}

export function setStoredTheme(mode: ThemeMode) {
	window.localStorage.setItem(THEME_STORAGE_KEY, mode);
	applyTheme(mode);
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
	if (mode === "light") {
		return (
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				width="20"
				height="20"
				fill="none"
			>
				<circle
					cx="12"
					cy="12"
					r="4"
					stroke="currentColor"
					strokeWidth="1.75"
				/>
				<path
					stroke="currentColor"
					strokeWidth="1.75"
					strokeLinecap="round"
					d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
				/>
			</svg>
		);
	}

	if (mode === "dark") {
		return (
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				width="20"
				height="20"
				fill="none"
			>
				<path
					fill="currentColor"
					d="M14.5 2.5a8.5 8.5 0 1 0 9 9 6.5 6.5 0 0 1-9-9Z"
				/>
			</svg>
		);
	}

	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			width="20"
			height="20"
			fill="none"
		>
			<rect
				x="3"
				y="4"
				width="18"
				height="12"
				rx="2"
				stroke="currentColor"
				strokeWidth="1.75"
			/>
			<path
				stroke="currentColor"
				strokeWidth="1.75"
				d="M8 20h8"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function ThemeModePicker({ className }: { className?: string }) {
	const [mode, setMode] = useState<ThemeMode>("auto");

	useEffect(() => {
		const current = getStoredTheme();
		setMode(current);
		applyTheme(current);

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onSystemChange = () => {
			if (getStoredTheme() === "auto") {
				applyTheme("auto");
			}
		};

		media.addEventListener("change", onSystemChange);
		return () => media.removeEventListener("change", onSystemChange);
	}, []);

	return (
		<div
			className={cn("grid gap-2 sm:grid-cols-3", className)}
			data-testid="theme-mode-picker"
		>
			{MODES.map((option) => {
				const selected = mode === option;
				return (
					<button
						key={option}
						type="button"
						aria-pressed={selected}
						data-testid={`theme-mode-${option}`}
						className={cn(
							"flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition",
							selected
								? "border-primary bg-primary/5 text-foreground"
								: "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
						onClick={() => {
							setStoredTheme(option);
							setMode(option);
						}}
					>
						<ThemeIcon mode={option} />
						<span>{THEME_MODE_LABELS[option]}</span>
					</button>
				);
			})}
		</div>
	);
}

export default function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>("auto");

	useEffect(() => {
		const current = getStoredTheme();
		setMode(current);
		applyTheme(current);

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onSystemChange = () => {
			if (getStoredTheme() === "auto") {
				applyTheme("auto");
			}
		};

		media.addEventListener("change", onSystemChange);
		return () => media.removeEventListener("change", onSystemChange);
	}, []);

	function cycleTheme() {
		const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
		setStoredTheme(next);
		setMode(next);
	}

	return (
		<button
			type="button"
			onClick={cycleTheme}
			className="rounded-xl border border-border bg-card p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
			aria-label={`${THEME_MODE_LABELS[mode]}. Нажмите, чтобы сменить.`}
			title={THEME_MODE_LABELS[mode]}
		>
			<ThemeIcon mode={mode} />
		</button>
	);
}
