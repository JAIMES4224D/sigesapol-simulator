import { useSimStore, NodeId } from "../store/useStore";

/* ── Mini mapa de topología ──────────────────────────────────────────── */
const STATUS_COLOR: Record<string, string> = {
  idle:    "#0aa7b8", active: "#00f0ff",
  warning: "#ffb800", breached: "#ff3b5c", healthy: "#19ffb0",
};
const MAP_NODES: { id: NodeId; label: string; x: number; y: number }[] = [
  { id: "internet",     label: "NET",  x: 50, y: 4  },
  { id: "firewall",     label: "FW",   x: 50, y: 17 },
  { id: "ids",          label: "IDS",  x: 50, y: 30 },
  { id: "loadbalancer", label: "LB",   x: 50, y: 43 },
  { id: "web01",        label: "W1",   x: 22, y: 56 },
  { id: "web02",        label: "W2",   x: 78, y: 56 },
  { id: "authservice",  label: "AUTH", x: 50, y: 69 },
  { id: "database",     label: "DB",   x: 50, y: 83 },
];
const MAP_EDGES: [NodeId, NodeId][] = [
  ["internet","firewall"],["firewall","ids"],["ids","loadbalancer"],
  ["loadbalancer","web01"],["loadbalancer","web02"],
  ["web01","authservice"],["web02","authservice"],["authservice","database"],
];
const W = 110; const H = 200;
function toSVG(x: number, y: number): [number, number] {
  return [x * W / 100, y * H / 100];
}

function TopologyMap() {
  const nodes   = useSimStore((s) => s.nodes);
  const packets = useSimStore((s) => s.packets);
  const activeIds = new Set<NodeId>(packets.flatMap((p) => p.path));
  const activeEdges = new Set<string>();
  packets.forEach((p) => {
    p.path.forEach((_, i) => {
      if (i < p.path.length - 1) activeEdges.add(`${p.path[i]}-${p.path[i+1]}`);
    });
  });

  return (
    <div className="panel rounded-md overflow-hidden">
      <div className="px-2.5 py-1.5 border-b border-panel-edge flex items-center justify-between">
        <span className="label-eyebrow">TOPOLOGÍA</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-healthy pulse-glow" />
          <span className="font-mono text-[8px] text-healthy">LIVE</span>
        </span>
      </div>
      <div className="p-1.5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {MAP_EDGES.map(([a, b]) => {
            const na = MAP_NODES.find((n) => n.id === a)!;
            const nb = MAP_NODES.find((n) => n.id === b)!;
            const [x1,y1] = toSVG(na.x, na.y);
            const [x2,y2] = toSVG(nb.x, nb.y);
            const isActive = activeEdges.has(`${a}-${b}`);
            return (
              <line key={`${a}-${b}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isActive ? "#00f0ff" : "#0e2a3d"}
                strokeWidth={isActive ? 1.8 : 0.8}
                strokeDasharray={isActive ? undefined : "2,2"}
              />
            );
          })}
          {MAP_NODES.map((n) => {
            const status = nodes[n.id]?.status ?? "idle";
            const color  = STATUS_COLOR[status];
            const [cx,cy] = toSVG(n.x, n.y);
            const isActive = activeIds.has(n.id);
            return (
              <g key={n.id}>
                {isActive && <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.15}/>}
                <circle cx={cx} cy={cy} r={3.8} fill="#0b1220" stroke={color} strokeWidth={1.3}/>
                <text x={cx} y={cy+9} textAnchor="middle" fontSize="5"
                  fill={color} fontFamily="JetBrains Mono,monospace" letterSpacing="0.4">
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

/* ── Stats de sesión ─────────────────────────────────────────────────── */
function SessionStats() {
  const metrics  = useSimStore((s) => s.metrics);
  const packets  = useSimStore((s) => s.packets);
  const scenario = useSimStore((s) => s.scenario);

  const SCENARIO_LABEL: Record<string, string> = {
    normal:"Tráfico Normal", intrusion:"Intrusión",
    overload:"Sobrecarga",   ddos:"Ataque DDoS", failover:"Mantenimiento",
  };

  const rows = [
    { label: "Escenario",   value: SCENARIO_LABEL[scenario] ?? scenario },
    { label: "Pkts activos",value: `${packets.length}` },
    { label: "Total proc.", value: `${metrics.processedTotal}` },
    { label: "Bloqueados",  value: `${metrics.blockedCount}` },
    { label: "Latencia",    value: `${metrics.latencyMs} ms` },
    { label: "Pkt/s",       value: `${metrics.packetsPerSec}` },
  ];

  return (
    <div className="panel rounded-md px-2.5 py-2">
      <span className="label-eyebrow block mb-2">SESIÓN</span>
      <div className="space-y-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-white/30">{label}</span>
            <span className="font-mono text-[10px] text-cyan-dim">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Composición del panel izquierdo ─────────────────────────────────── */
export default function LeftPanel() {
  return (
    <>
      <TopologyMap />
      <SessionStats />
    </>
  );
}
