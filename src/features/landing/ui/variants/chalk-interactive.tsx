import {
	Circle,
	Coordinates,
	Line,
	Mafs,
	Plot,
	Point,
	Text,
	useMovablePoint,
} from "mafs";
import { useEffect, useState } from "react";

import "mafs/core.css";
import "mafs/font.css";

const TEAL = "#0D7377";
const CORAL = "#FF6B5B";
const INK = "#0b1c33";

function useMounted(): boolean {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	return mounted;
}

function Slider({
	label,
	value,
	min,
	max,
	step,
	onChange,
	display,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (v: number) => void;
	display: string;
}) {
	return (
		<label className="flex items-center gap-3 text-sm">
			<span className="w-6 font-mono font-semibold text-[#0D7377]">
				{label}
			</span>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[#0D7377]/20 accent-[#FF6B5B]"
			/>
			<span className="w-12 text-right font-mono text-xs text-[#0b1c33]/60">
				{display}
			</span>
		</label>
	);
}

function Widget({
	title,
	formula,
	caption,
	children,
}: {
	title: string;
	formula: string;
	caption: string;
	children: React.ReactNode;
}) {
	return (
		<article className="flex flex-col overflow-hidden rounded-2xl border border-[#0D7377]/20 bg-white shadow-sm">
			<div className="border-b border-[#0D7377]/15 bg-[#f4f7f6] px-5 py-4">
				<h3 className="font-display text-lg font-semibold text-[#0b1c33]">
					{title}
				</h3>
				<p className="mt-0.5 font-mono text-sm text-[#0D7377]">{formula}</p>
			</div>
			<div className="min-h-[280px] flex-1">{children}</div>
			<p className="border-t border-[#0D7377]/15 px-5 py-3 text-xs text-[#0b1c33]/60">
				{caption}
			</p>
		</article>
	);
}

function Placeholder() {
	return (
		<div className="flex h-[280px] items-center justify-center font-mono text-xs text-[#0D7377]/50">
			загружаю чертёж…
		</div>
	);
}

function ParabolaWidget() {
	const mounted = useMounted();
	const [a, setA] = useState(0.8);
	const [c, setC] = useState(-1);

	if (!mounted) {
		return <Placeholder />;
	}

	const vertex: [number, number] = [0, c];
	const roots =
		a !== 0 && -c / a >= 0
			? ([-Math.sqrt(-c / a), Math.sqrt(-c / a)] as const)
			: null;

	return (
		<div>
			<Mafs
				viewBox={{ x: [-4, 4], y: [-4, 3] }}
				height={280}
				pan={false}
				zoom={false}
			>
				<Coordinates.Cartesian />
				<Plot.OfX
					y={(x) => a * x * x + c}
					color={TEAL}
					opacity={1}
					weight={2.5}
				/>
				<Point x={vertex[0]} y={vertex[1]} color={CORAL} />
				<Text x={0.4} y={c} attach="w" color={CORAL} size={14}>
					вершина (0; {c.toFixed(1)})
				</Text>
				{roots
					? roots.map((r) => <Point key={r} x={r} y={0} color={INK} />)
					: null}
			</Mafs>
			<div className="space-y-2 px-5 pb-4 pt-1">
				<Slider
					label="a"
					value={a}
					min={-2}
					max={2}
					step={0.1}
					onChange={setA}
					display={a.toFixed(1)}
				/>
				<Slider
					label="c"
					value={c}
					min={-3}
					max={3}
					step={0.1}
					onChange={setC}
					display={c.toFixed(1)}
				/>
			</div>
		</div>
	);
}

function UnitCircleWidget() {
	const mounted = useMounted();
	const angle = useMovablePoint([Math.SQRT1_2, Math.SQRT1_2], {
		constrain: ([x, y]) => {
			const len = Math.hypot(x, y);
			return len === 0 ? [1, 0] : [x / len, y / len];
		},
		color: CORAL,
	});

	if (!mounted) {
		return <Placeholder />;
	}

	const [cos, sin] = angle.point;

	return (
		<div>
			<Mafs
				viewBox={{ x: [-1.6, 1.6], y: [-1.5, 1.5] }}
				height={280}
				pan={false}
				zoom={false}
			>
				<Coordinates.Cartesian
					subdivisions={2}
					xAxis={{ labels: false, axis: true }}
					yAxis={{ labels: false, axis: true }}
				/>
				<Circle
					center={[0, 0]}
					radius={1}
					strokeStyle="solid"
					strokeOpacity={0.5}
					fillOpacity={0.03}
					color={TEAL}
				/>
				<Line.Segment
					point1={[0, 0]}
					point2={[cos, sin]}
					color={TEAL}
					weight={2.5}
				/>
				<Line.Segment
					point1={[cos, 0]}
					point2={[cos, sin]}
					color={CORAL}
					style="dashed"
					weight={2}
				/>
				<Line.Segment
					point1={[0, 0]}
					point2={[cos, 0]}
					color={INK}
					weight={3}
					opacity={0.65}
				/>
				<Text x={cos / 2} y={-0.18} attach="n" color={INK} size={13}>
					cos θ = {cos.toFixed(2)}
				</Text>
				<Text x={cos + 0.08} y={sin / 2} attach="w" color={CORAL} size={13}>
					sin θ = {sin.toFixed(2)}
				</Text>
				{angle.element}
			</Mafs>
			<p className="px-5 pb-4 pt-1 font-mono text-xs text-[#0b1c33]/60">
				Тяни точку по окружности — косинус (по оси x) и синус (по оси y)
				меняются вместе с ней. Всегда cos²θ + sin²θ = 1.
			</p>
		</div>
	);
}

function VectorsWidget() {
	const mounted = useMounted();
	const u = useMovablePoint([1.4, 1.2], { color: TEAL });
	const v = useMovablePoint([-1.2, 1.6], { color: CORAL });

	if (!mounted) {
		return <Placeholder />;
	}

	const sum: [number, number] = [
		u.point[0] + v.point[0],
		u.point[1] + v.point[1],
	];

	return (
		<div>
			<Mafs
				viewBox={{ x: [-4, 4], y: [-1.5, 4] }}
				height={280}
				pan={false}
				zoom={false}
			>
				<Coordinates.Cartesian />
				<Line.Segment
					point1={[0, 0]}
					point2={u.point}
					color={TEAL}
					weight={2.5}
				/>
				<Line.Segment
					point1={[0, 0]}
					point2={v.point}
					color={CORAL}
					weight={2.5}
				/>
				<Line.Segment
					point1={u.point}
					point2={sum}
					color={CORAL}
					style="dashed"
					weight={1.5}
					opacity={0.7}
				/>
				<Line.Segment
					point1={v.point}
					point2={sum}
					color={TEAL}
					style="dashed"
					weight={1.5}
					opacity={0.7}
				/>
				<Line.Segment point1={[0, 0]} point2={sum} color={INK} weight={3} />
				<Point x={sum[0]} y={sum[1]} color={INK} />
				<Text
					x={u.point[0] / 2}
					y={u.point[1] / 2 + 0.28}
					attach="n"
					color={TEAL}
					size={14}
				>
					u⃗
				</Text>
				<Text
					x={v.point[0] / 2}
					y={v.point[1] / 2 + 0.28}
					attach="n"
					color={CORAL}
					size={14}
				>
					v⃗
				</Text>
				<Text
					x={sum[0] / 2 + 0.25}
					y={sum[1] / 2}
					attach="w"
					color={INK}
					size={14}
				>
					u⃗ + v⃗
				</Text>
				{u.element}
				{v.element}
			</Mafs>
			<p className="px-5 pb-4 pt-1 font-mono text-xs text-[#0b1c33]/60">
				Двигай векторы — сумма достраивается до параллелограмма. Так же
				складываются скорости и силы в физике.
			</p>
		</div>
	);
}

/**
 * Interactive Mafs theory widgets for the Chalk landing.
 */
export function ChalkTheorySection() {
	return (
		<section
			id="theory"
			className="scroll-mt-20 bg-[#f4f7f6] py-20 text-[#0b1c33] sm:py-28"
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<p className="mb-3 text-sm font-medium tracking-wide text-[#FF6B5B] uppercase">
					Живая теория
				</p>
				<h2 className="font-display max-w-2xl text-3xl font-semibold sm:text-4xl">
					Теорию видно руками — потрогай сам
				</h2>
				<p className="mt-4 max-w-xl text-base text-[#0b1c33]/65">
					На уроках мы не зубрим формулы, а строим их. Вот три интерактивных
					чертежа — двигай точки и слайдеры, как на занятии.
				</p>
				<div className="mt-12 grid gap-6 lg:grid-cols-3">
					<Widget
						title="Парабола"
						formula="y = a·x² + c"
						caption="Коэффициент a растягивает и переворачивает ветви, c поднимает вершину. Задание №11 ЕГЭ — про такие картинки."
					>
						<ParabolaWidget />
					</Widget>
					<Widget
						title="Единичная окружность"
						formula="cos θ, sin θ"
						caption="Синус и косинус — просто координаты точки. Одна картинка заменяет страницу таблиц."
					>
						<UnitCircleWidget />
					</Widget>
					<Widget
						title="Сложение векторов"
						formula="u⃗ + v⃗"
						caption="Правило параллелограмма — основа кинематики и статики в ЕГЭ по физике."
					>
						<VectorsWidget />
					</Widget>
				</div>
			</div>
		</section>
	);
}

export default ChalkTheorySection;
