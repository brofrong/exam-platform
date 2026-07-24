export function LandingStub() {
	return (
		<main
			className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-10"
			data-testid="landing-stub"
		>
			<h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
				Exam Platform — скоро
			</h1>
			<p className="max-w-xl text-muted-foreground">
				Платформа для подготовки к ЕГЭ и ОГЭ. Следите за обновлениями.
			</p>
		</main>
	);
}
