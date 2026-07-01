import { useSimStore } from "../store/useStore";
import { getScenarioSteps, logForScenario } from "../animations/scenarios";

const SCENARIOS: { id: "normal" | "intrusion" | "overload"; label: string; color: string }[] = [
  { id: "normal", label: "Tráfico normal", color: "border-healthy text-healthy" },
  { id: "intrusion", label: "Intrusión", color: "border-danger text-danger" },
  { id: "overload", label: "Sobrecarga", color: "border-amber text-amber" },
];

export default function HeaderBar() {
  const scenario = useSimStore((s) => s.scenario);
  const setScenario = useSimStore((s) => s.setScenario);
  const startPacket = useSimStore((s) => s.startPacket);
  const resetAllStatuses = useSimStore((s) => s.resetAllStatuses);
  const addLog = useSimStore((s) => s.addLog);
  const speed = useSimStore((s) => s.speed);
  const setSpeed = useSimStore((s) => s.setSpeed);
  const followCamera = useSimStore((s) => s.followCamera);
  const toggleCamera = useSimStore((s) => s.toggleCamera);

  const runScenario = (id: "normal" | "intrusion" | "overload") => {
    setScenario(id);
    resetAllStatuses();
    const steps = getScenarioSteps(id);
    logForScenario(id);
    let delay = 0;
    steps.forEach((step) => {
      delay += step.delayBefore ?? 0;
      setTimeout(() => {
        startPacket(step.path, step.blocked, step.variant);
      }, delay);
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
      <div className="pointer-events-auto">
        <div className="label-eyebrow">SIGESAPOL // NETWORK DIGITAL TWIN</div>
        <h1 className="font-display text-xl tracking-wide text-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]">
          SIMULADOR DE RED EN TIEMPO REAL
        </h1>
      </div>

      <div className="pointer-events-auto flex items-center gap-2 panel rounded-md px-3 py-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => runScenario(s.id)}
            className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-all ${
              scenario === s.id ? `${s.color} bg-white/5 shadow-glow` : "border-panel-edge text-white/50 hover:text-white/80"
            }`}
          >
            {s.label}
          </button>
        ))}
        <div className="w-px h-6 bg-panel-edge mx-1" />
        <button
          onClick={() => {
            resetAllStatuses();
            addLog("info", "Estado de la red reiniciado.");
          }}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm border border-panel-edge text-white/50 hover:text-white/80"
        >
          Reset
        </button>
        <div className="flex items-center gap-1 ml-1">
          <span className="font-mono text-[10px] text-white/40">VEL</span>
          {[0.5, 1, 2].map((v) => (
            <button
              key={v}
              onClick={() => setSpeed(v)}
              className={`font-mono text-[10px] px-2 py-1 rounded-sm border ${
                speed === v ? "border-cyan text-cyan" : "border-panel-edge text-white/40"
              }`}
            >
              {v}x
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-panel-edge mx-1" />
        <button
          onClick={toggleCamera}
          title="Activa la cámara libre para orbitar 360° sin que la cámara automática te jale de vuelta"
          className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-all ${
            !followCamera
              ? "border-magenta text-magenta bg-white/5 shadow-glow-magenta"
              : "border-panel-edge text-white/50 hover:text-white/80"
          }`}
        >
          {followCamera ? "Cámara auto" : "Cámara libre"}
        </button>
      </div>
    </div>
  );
}
