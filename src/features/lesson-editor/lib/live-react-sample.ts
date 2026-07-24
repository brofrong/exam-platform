/** Default sine-plot sample from the exam-platform design doc. */
export const SINE_PLOT_LIVE_REACT_CODE = `export default function App() {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Mafs
        viewBox={{ x: [-5, 5], y: [-5, 5] }}
        preserveAspectRatio="none"
        zoom
      >
        <Coordinates.Cartesian />
        <Plot.OfX y={(x) => Math.sin(x)} color={Theme.blue} />
      </Mafs>
    </div>
  );
}`;
