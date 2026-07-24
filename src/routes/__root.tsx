import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AppChrome } from "#/features/shell/ui/app-chrome";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "PHYS&MATH — подготовка к ЕГЭ и ОГЭ",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	pendingComponent: RootPending,
	errorComponent: RootError,
	shellComponent: RootDocument,
});

function RootPending() {
	return (
		<main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center px-4 py-10">
			<p className="text-sm text-muted-foreground">Загрузка...</p>
		</main>
	);
}

function RootError({ error }: { error: Error }) {
	return (
		<main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center px-4 py-10">
			<div className="max-w-md space-y-2 text-center">
				<h1 className="text-lg font-semibold text-foreground">
					Что-то пошло не так
				</h1>
				<p className="text-sm text-muted-foreground">
					{error.message || "Неизвестная ошибка"}
				</p>
			</div>
		</main>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru" suppressHydrationWarning>
			<head>
				{/** biome-ignore lint/security/noDangerouslySetInnerHtml: We are using a trusted script */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-primary/20">
				<AppChrome>{children}</AppChrome>
				<Toaster />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
