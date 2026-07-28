/** Plot kinds used in demo theory activities. */
export type PlotKind =
	| "linear"
	| "quadratic"
	| "sine"
	| "absolute"
	| "exponential"
	| "circle"
	| "vectors"
	| "xt-motion"
	| "vt-motion"
	| "projectile"
	| "iv-ohm"
	| "wave"
	| "hooke"
	| "power"
	| "hyperbola"
	| "cubic";

function wrap(body: string): string {
	return `export default function App() {
  return (
    <div style={{ width: "100%", height: "420px" }}>
      <Mafs viewBox={{ x: [-6, 6], y: [-4, 4] }} preserveAspectRatio={false} zoom>
        <Coordinates.Cartesian />
${body}
      </Mafs>
    </div>
  );
}`;
}

/** TipTap liveReact `code` attr — Mafs scope only (see live-react-block). */
export function mafsCodeFor(kind: PlotKind): string {
	switch (kind) {
		case "linear":
			return wrap(
				`        <Plot.OfX y={(x) => 0.5 * x + 1} color={Theme.blue} />
        <Plot.OfX y={(x) => -x + 2} color={Theme.pink} />`,
			);
		case "quadratic":
			return wrap(
				`        <Plot.OfX y={(x) => 0.25 * x * x - 2} color={Theme.blue} />
        <Point x={0} y={-2} color={Theme.pink} />`,
			);
		case "sine":
			return wrap(
				`        <Plot.OfX y={(x) => Math.sin(x)} color={Theme.blue} />
        <Plot.OfX y={(x) => Math.cos(x)} color={Theme.green} />`,
			);
		case "absolute":
			return wrap(
				`        <Plot.OfX y={(x) => Math.abs(x) - 1} color={Theme.blue} />`,
			);
		case "exponential":
			return wrap(
				`        <Plot.OfX y={(x) => Math.exp(0.35 * x) - 1.5} color={Theme.indigo} />
        <Plot.OfX y={(x) => Math.exp(-0.35 * x) - 1.5} color={Theme.orange} />`,
			);
		case "hyperbola":
			return wrap(
				`        <Plot.OfX y={(x) => (Math.abs(x) < 0.25 ? Number.NaN : 2 / x)} color={Theme.blue} />`,
			);
		case "cubic":
			return wrap(
				`        <Plot.OfX y={(x) => 0.08 * x * x * x - 0.6 * x} color={Theme.violet} />`,
			);
		case "circle":
			return `export default function App() {
  return (
    <div style={{ width: "100%", height: "420px" }}>
      <Mafs viewBox={{ x: [-4, 4], y: [-3, 3] }} preserveAspectRatio={false} zoom>
        <Coordinates.Cartesian />
        <Plot.Parametric
          domain={[0, 2 * Math.PI]}
          xy={(t) => [2 * Math.cos(t), 2 * Math.sin(t)]}
          color={Theme.blue}
        />
        <Point x={2} y={0} color={Theme.pink} />
        <Point x={0} y={0} color={Theme.foreground} />
        <Line.Segment point1={[0, 0]} point2={[2, 0]} color={Theme.pink} />
      </Mafs>
    </div>
  );
}`;
		case "vectors":
			return `export default function App() {
  return (
    <div style={{ width: "100%", height: "420px" }}>
      <Mafs viewBox={{ x: [-1, 6], y: [-1, 5] }} preserveAspectRatio={false} zoom>
        <Coordinates.Cartesian />
        <Vector tip={[4, 1]} color={Theme.blue} />
        <Vector tip={[1, 3]} color={Theme.green} />
        <Vector tip={[5, 4]} color={Theme.pink} />
        <Point x={0} y={0} color={Theme.foreground} />
      </Mafs>
    </div>
  );
}`;
		case "xt-motion":
			return wrap(
				`        <Plot.OfX y={(x) => (x < 0 ? Number.NaN : 0.15 * x * x)} color={Theme.blue} />
        <Plot.OfX y={(x) => (x < 0 ? Number.NaN : 0.8 * x)} color={Theme.orange} />`,
			);
		case "vt-motion":
			return wrap(
				`        <Plot.OfX y={(x) => (x < 0 ? Number.NaN : 0.4 * x + 0.5)} color={Theme.blue} />
        <Plot.OfX y={(x) => (x < 0 ? Number.NaN : 2)} color={Theme.green} />`,
			);
		case "projectile":
			return wrap(
				`        <Plot.OfX y={(x) => (x < 0 || x > 5 ? Number.NaN : -0.35 * x * x + 1.8 * x)} color={Theme.blue} />
        <Point x={0} y={0} color={Theme.pink} />
        <Point x={5} y={0} color={Theme.pink} />`,
			);
		case "iv-ohm":
			return wrap(
				`        <Plot.OfX y={(x) => (x < 0 ? Number.NaN : 0.6 * x)} color={Theme.blue} />
        <Plot.OfX y={(x) => (x < 0 ? Number.NaN : 1.2 * x)} color={Theme.orange} />`,
			);
		case "wave":
			return wrap(
				`        <Plot.OfX y={(x) => 1.5 * Math.sin(1.2 * x)} color={Theme.blue} />
        <Plot.OfX y={(x) => 1.5 * Math.sin(1.2 * x + 1)} color={Theme.pink} />`,
			);
		case "hooke":
			return wrap(
				`        <Plot.OfX y={(x) => (x < 0 ? Number.NaN : -0.7 * x)} color={Theme.blue} />
        <Point x={2} y={-1.4} color={Theme.pink} />`,
			);
		case "power":
			return wrap(
				`        <Plot.OfX y={(x) => (x < 0 ? Number.NaN : 0.12 * x * x)} color={Theme.indigo} />`,
			);
		default: {
			const _exhaustive: never = kind;
			return _exhaustive;
		}
	}
}
