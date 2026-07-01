import { useSimStore, ScenarioId } from "../store/useStore";
import { getScenarioConfig, applyPresetStatuses, logForScenario } from "../animations/scenarios";

const STATUS_COLOR: Record<string, string> = {
  "OPERACIÓN ESTABLE": "text-healthy",
  "ALERTA ACTIVA":     "text-amber",
  "BAJO ATAQUE":       "text-danger",
  "FAILOVER ACTIVO":   "text-cyan",
  "SOBRECARGA":        "text-magenta",
};
const STATUS_DOT: Record<string, string> = {
  "OPERACIÓN ESTABLE": "bg-healthy",
  "ALERTA ACTIVA":     "bg-amber",
  "BAJO ATAQUE":       "bg-danger",
  "FAILOVER ACTIVO":   "bg-cyan",
  "SOBRECARGA":        "bg-magenta",
};

const SCENARIOS: { id: ScenarioId; label: string }[] = [
  { id: "normal",    label: "TRÁFICO NORMAL" },
  { id: "intrusion", label: "INTRUSIÓN" },
  { id: "overload",  label: "SOBRECARGA" },
  { id: "ddos",      label: "ATAQUE DDoS" },
  { id: "failover",  label: "MANTENIMIENTO" },
];

const SCENARIO_ACTIVE: Record<ScenarioId, string> = {
  normal:    "border-healthy  text-healthy  bg-healthy/5",
  intrusion: "border-amber    text-amber    bg-amber/5",
  overload:  "border-magenta  text-magenta  bg-magenta/5",
  ddos:      "border-danger   text-danger   bg-danger/5",
  failover:  "border-cyan     text-cyan     bg-cyan/5",
};

function MetricChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center px-4 border-r border-panel-edge last:border-none min-w-[70px]">
      <span className="font-mono text-[8px] tracking-widest text-white/35 uppercase">{label}</span>
      <span className={`font-display text-sm font-semibold tracking-wide ${color}`}>{value}</span>
    </div>
  );
}

export default function TopBar() {
  const scenario      = useSimStore((s) => s.scenario);
  const metrics       = useSimStore((s) => s.metrics);
  const speed         = useSimStore((s) => s.speed);
  const followCam     = useSimStore((s) => s.followCamera);
  const setScenario   = useSimStore((s) => s.setScenario);
  const startPacket   = useSimStore((s) => s.startPacket);
  const resetAll      = useSimStore((s) => s.resetAllStatuses);
  const addLog        = useSimStore((s) => s.addLog);
  const setSpeed      = useSimStore((s) => s.setSpeed);
  const toggleCamera  = useSimStore((s) => s.toggleCamera);

  const runScenario = (id: ScenarioId) => {
    setScenario(id);
    resetAll();
    applyPresetStatuses(id);
    logForScenario(id);
    const { steps } = getScenarioConfig(id);
    let delay = 0;
    steps.forEach((step) => {
      delay += step.delayBefore ?? 0;
      setTimeout(() => startPacket(step.path, step.blocked, step.variant), delay);
    });
  };

  const fmtUptime = (s: number) => {
    const h  = Math.floor(s / 3600).toString().padStart(2, "0");
    const m  = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${ss}`;
  };

  return (
    <div className="flex-shrink-0 border-b border-panel-edge bg-void/95 backdrop-blur-sm">
      {/* ── Fila 1: título + métricas ── */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1.5">
        {/* Título + estado */}
        <div className="min-w-0">
          <div className="label-eyebrow">SIGESAPOL // NETWORK DIGITAL TWIN</div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-base font-semibold text-cyan
                           drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] leading-tight whitespace-nowrap">
              SIMULADOR DE RED EN TIEMPO REAL
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full pulse-glow ${STATUS_DOT[metrics.systemStatus] ?? "bg-healthy"}`} />
            <span className={`font-mono text-[10px] tracking-wide ${STATUS_COLOR[metrics.systemStatus] ?? "text-healthy"}`}>
              {metrics.systemStatus}
            </span>
            <span className="text-white/25 font-mono text-[9px]">
              / {metrics.latencyMs} ms / {metrics.packetsPerSec} pkt/s
            </span>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="flex items-stretch panel rounded-md ml-4">
          <MetricChip label="AMENAZA" value={`${metrics.threatLevel}%`}
            color={metrics.threatLevel > 70 ? "text-danger" : metrics.threatLevel > 30 ? "text-amber" : "text-healthy"} />
          <MetricChip label="CARGA" value={`${metrics.load}%`}
            color={metrics.load > 75 ? "text-danger" : metrics.load > 45 ? "text-amber" : "text-healthy"} />
          <MetricChip label="BLOQUEADOS" value={`${metrics.blockedCount}`}
            color={metrics.blockedCount > 0 ? "text-danger" : "text-white/50"} />
          <MetricChip label="PROCESADOS" value={`${metrics.processedTotal}`} color="text-cyan" />
          <MetricChip label="UPTIME" value={fmtUptime(metrics.uptime)} color="text-white/50" />
        </div>
      </div>

      {/* ── Fila 2: escenarios + controles ── */}
      <div className="flex items-center gap-1.5 px-4 pb-2">
        {SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => runScenario(s.id)}
            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-all whitespace-nowrap ${
              scenario === s.id ? SCENARIO_ACTIVE[s.id] : "border-panel-edge text-white/35 hover:text-white/65 hover:border-white/25"
            }`}>
            {s.label}
          </button>
        ))}

        <div className="flex-1" />

        <button onClick={() => { resetAll(); addLog("info", "Estado de la red reiniciado."); }}
          className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm border border-panel-edge text-white/35 hover:text-white/65">
          RESET
        </button>

        <div className="flex items-center gap-1 panel rounded-sm px-2 py-1">
          <span className="font-mono text-[8px] text-white/25 mr-0.5">VEL</span>
          {[0.5, 1, 2].map((v) => (
            <button key={v} onClick={() => setSpeed(v)}
              className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border transition-all ${
                speed === v ? "border-cyan text-cyan" : "border-panel-edge text-white/30"
              }`}>
              {v}x
            </button>
          ))}
        </div>

        <button onClick={toggleCamera}
          className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-all whitespace-nowrap ${
            !followCam ? "border-magenta text-magenta bg-magenta/5" : "border-panel-edge text-white/35 hover:text-white/65"
          }`}>
          {followCam ? "CÁMARA AUTO" : "CÁMARA LIBRE"}
        </button>
      </div>
    </div>
  );
}
