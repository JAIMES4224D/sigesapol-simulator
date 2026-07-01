import { useSimStore, NodeId } from "../store/useStore";

const STATUS_COLOR: Record<string, string> = {
  idle:    "#0aa7b8",
  active:  "#00f0ff",
  warning: "#ffb800",
  breached:"#ff3b5c",
  healthy: "#19ffb0",
};

/** Posiciones 2D normalizadas del mini mapa (x, y) en % del contenedor */
const MAP_NODES: { id: NodeId; label: string; x: number; y: number }[] = [
  { id: "internet",     label: "NET",  x: 50,  y: 2  },
  { id: "firewall",     label: "FW",   x: 50,  y: 16 },
  { id: "ids",          label: "IDS",  x: 50,  y: 30 },
  { id: "loadbalancer", label: "LB",   x: 50,  y: 44 },
  { id: "web01",        label: "W1",   x: 22,  y: 58 },
  { id: "web02",        label: "W2",   x: 78,  y: 58 },
  { id: "authservice",  label: "AUTH", x: 50,  y: 72 },
  { id: "database",     label: "DB",   x: 50,  y: 87 },
];

const MAP_EDGES: [NodeId, NodeId][] = [
  ["internet", "firewall"],
  ["firewall", "ids"],
  ["ids", "loadbalancer"],
  ["loadbalancer", "web01"],
  ["loadbalancer", "web02"],
  ["web01", "authservice"],
  ["web02", "authservice"],
  ["authservice", "database"],
];

const W = 120; // SVG viewBox width
const H = 220; // SVG viewBox height

function toSVG(xPct: number, yPct: number): [number, number] {
  return [xPct * W / 100, yPct * H / 100];
}

export default function TopologyMap() {
  const nodes  = useSimStore((s) => s.nodes);
  const packets = useSimStore((s) => s.packets);

  const activeNodeIds = new Set<NodeId>(packets.flatMap((p) => p.path));

  return (
    <div className="panel rounded-md overflow-hidden">
      <div className="px-3 py-2 border-b border-panel-edge flex items-center justify-between">
        <span className="label-eyebrow">TOPOLOGÍA</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-healthy pulse-glow" />
          <span className="font-mono text-[9px] text-healthy">LIVE</span>
        </span>
      </div>

      <div className="px-2 py-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* edges */}
          {MAP_EDGES.map(([a, b]) => {
            const na = MAP_NODES.find((n) => n.id === a)!;
            const nb = MAP_NODES.find((n) => n.id === b)!;
            const [x1, y1] = toSVG(na.x, na.y);
            const [x2, y2] = toSVG(nb.x, nb.y);
            const active = activeNodeIds.has(a) && activeNodeIds.has(b);
            return (
              <line
                key={`${a}-${b}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={active ? "#00f0ff" : "#0e2a3d"}
                strokeWidth={active ? 1.5 : 0.8}
                strokeDasharray={active ? undefined : "2,2"}
              />
            );
          })}

          {/* nodes */}
          {MAP_NODES.map((n) => {
            const status = nodes[n.id]?.status ?? "idle";
            const color  = STATUS_COLOR[status];
            const [cx, cy] = toSVG(n.x, n.y);
            const isActive = status === "active" || status === "healthy";
            return (
              <g key={n.id}>
                {isActive && (
                  <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.18} />
                )}
                <circle
                  cx={cx} cy={cy} r={3.5}
                  fill="#0b1220"
                  stroke={color}
                  strokeWidth={1.2}
                />
                <text
                  x={cx} y={cy + 9}
                  textAnchor="middle"
                  fontSize="5"
                  fill={color}
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="0.5"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
