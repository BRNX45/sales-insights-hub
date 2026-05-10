type ChartType = "line" | "bar" | "pie" | "funnel" | "heatmap" | "scatter";

function LineSvg() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      <polyline
        fill="none"
        stroke="var(--color-accent-foreground)"
        strokeWidth="2"
        points="0,60 25,45 50,55 75,30 100,40 125,20 150,28 175,12 200,18"
      />
      <polyline
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeDasharray="3 3"
        points="0,70 25,62 50,65 75,55 100,58 125,48 150,52 175,40 200,42"
      />
    </svg>
  );
}

function BarSvg() {
  const bars = [40, 65, 30, 75, 50, 85, 45, 60];
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 25 + 4}
          y={80 - h}
          width="18"
          height={h}
          fill="var(--color-primary)"
          opacity={0.4 + (i % 4) * 0.15}
        />
      ))}
    </svg>
  );
}

function PieSvg() {
  return (
    <svg viewBox="0 0 80 80" className="h-full">
      <circle cx="40" cy="40" r="32" fill="var(--color-muted)" />
      <path d="M40 40 L40 8 A32 32 0 0 1 70 52 Z" fill="var(--color-primary)" />
      <path d="M40 40 L70 52 A32 32 0 0 1 28 70 Z" fill="var(--color-accent-foreground)" opacity="0.7" />
      <path d="M40 40 L28 70 A32 32 0 0 1 8 40 Z" fill="var(--color-primary)" opacity="0.5" />
      <circle cx="40" cy="40" r="14" fill="var(--color-card)" />
    </svg>
  );
}

function FunnelSvg() {
  const w = [180, 140, 100, 60];
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      {w.map((width, i) => (
        <rect
          key={i}
          x={(200 - width) / 2}
          y={i * 18 + 2}
          width={width}
          height="14"
          rx="3"
          fill="var(--color-primary)"
          opacity={1 - i * 0.18}
        />
      ))}
    </svg>
  );
}

function HeatmapSvg() {
  const cells = Array.from({ length: 7 * 12 });
  return (
    <svg viewBox="0 0 240 80" className="w-full h-full">
      {cells.map((_, i) => {
        const x = (i % 12) * 20;
        const y = Math.floor(i / 12) * 11;
        const o = ((i * 37) % 100) / 100;
        return <rect key={i} x={x} y={y} width="18" height="9" rx="1" fill="var(--color-primary)" opacity={0.15 + o * 0.7} />;
      })}
    </svg>
  );
}

function ScatterSvg() {
  const pts = Array.from({ length: 28 }, (_, i) => ({
    x: (i * 53) % 195 + 3,
    y: (i * 31) % 70 + 5,
    r: 2 + ((i * 7) % 4),
  }));
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="var(--color-primary)" opacity="0.6" />
      ))}
    </svg>
  );
}

const RENDERERS: Record<ChartType, () => React.ReactElement> = {
  line: LineSvg,
  bar: BarSvg,
  pie: PieSvg,
  funnel: FunnelSvg,
  heatmap: HeatmapSvg,
  scatter: ScatterSvg,
};

const LABELS: Record<ChartType, string> = {
  line: "Line Graph",
  bar: "Bar Graph",
  pie: "Pie Chart",
  funnel: "Funnel Chart",
  heatmap: "Heat Map",
  scatter: "Scatter Plot",
};

export function ChartPlaceholder({
  type,
  title,
  subtitle,
}: {
  type: ChartType;
  title: string;
  subtitle?: string;
}) {
  const Renderer = RENDERERS[type];
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{LABELS[type]}</div>
          <h3 className="text-sm font-semibold text-card-foreground mt-0.5">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="h-24 flex items-center">
        <Renderer />
      </div>
    </div>
  );
}

export function ChartGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{children}</div>;
}

export const CHART_TYPES: ChartType[] = ["line", "bar", "pie", "funnel", "heatmap", "scatter"];