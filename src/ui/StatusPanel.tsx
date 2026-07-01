import { useSimStore, NetworkNode } from "../store/useStore";

const STATUS_DOT: Record<string, string> = {
  idle:"bg-cyan-dim", active:"bg-cyan", warning:"bg-amber",
  breached:"bg-danger", healthy:"bg-healthy",
};
const STATUS_LABEL: Record<string, string> = {
  idle:"EN ESPERA", active:"PROCESANDO", warning:"ALERTA",
  breached:"VULNERADO", healthy:"SALUDABLE",
};
const STATUS_TEXT: Record<string, string> = {
  idle:"text-cyan-dim", active:"text-cyan", warning:"text-amber",
  breached:"text-danger", healthy:"text-healthy",
};

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 w-full bg-panel-edge rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

function NodeRow({ node }: { node: NetworkNode }) {
  const cpuColor = node.cpu > 80 ? "#ff3b5c" : node.cpu > 50 ? "#ffb800" : "#00f0ff";
  const memColor = node.memory > 80 ? "#ff3b5c" : node.memory > 50 ? "#ffb800" : "#19ffb0";
  const showBars = node.status !== "idle";

  return (
    <div className="py-2 border-b border-panel-edge/40 last:border-none">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] text-white/80 font-medium">{node.label}</span>
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[node.status]} pulse-glow`} />
          <span className={`font-mono text-[9px] tracking-wider ${STATUS_TEXT[node.status]}`}>
            {STATUS_LABEL[node.status]}
          </span>
        </span>
      </div>
      {showBars && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="font-mono text-[8px] text-white/25">CPU</span>
              <span className="font-mono text-[8px]" style={{ color: cpuColor }}>{node.cpu}%</span>
            </div>
            <Bar value={node.cpu} color={cpuColor} />
          </div>
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="font-mono text-[8px] text-white/25">MEM</span>
              <span className="font-mono text-[8px]" style={{ color: memColor }}>{node.memory}%</span>
            </div>
            <Bar value={node.memory} color={memColor} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusPanel() {
  const nodes   = useSimStore((s) => s.nodes);
  const metrics = useSimStore((s) => s.metrics);
  const list    = Object.values(nodes).filter((n) => n.id !== "internet");

  const riskColor = metrics.threatLevel > 70 ? "#ff3b5c" : metrics.threatLevel > 30 ? "#ffb800" : "#19ffb0";
  const loadColor = metrics.load > 75 ? "#ff3b5c" : metrics.load > 45 ? "#ffb800" : "#00f0ff";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-panel-edge flex-shrink-0">
        <span className="label-eyebrow">ESTADO DE LA INFRAESTRUCTURA</span>
      </div>

      {/* Métricas globales */}
      <div className="px-3 py-2 border-b border-panel-edge flex-shrink-0 space-y-2">
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px] text-white/45">RIESGO</span>
            <span className="font-mono text-[10px] font-semibold" style={{ color: riskColor }}>
              {metrics.threatLevel}%
            </span>
          </div>
          <Bar value={metrics.threatLevel} color={riskColor} />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px] text-white/45">CARGA GLOBAL</span>
            <span className="font-mono text-[10px] font-semibold" style={{ color: loadColor }}>
              {metrics.load}%
            </span>
          </div>
          <Bar value={metrics.load} color={loadColor} />
        </div>
      </div>

      {/* Lista de nodos — scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        {list.map((n) => <NodeRow key={n.id} node={n} />)}
      </div>
    </div>
  );
}
