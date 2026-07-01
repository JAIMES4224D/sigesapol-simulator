import { useEffect, useRef, useState } from "react";
import { useSimStore } from "../store/useStore";

const LEVEL_COLOR: Record<string, string> = {
  info:"text-cyan-dim", warn:"text-amber", error:"text-danger", success:"text-healthy",
};
const LEVEL_BG: Record<string, string> = {
  info:"bg-cyan/5", warn:"bg-amber/5", error:"bg-danger/5", success:"bg-healthy/5",
};
const LEVEL_TAG: Record<string, string> = {
  info:"INFO", warn:"WARN", error:"FAIL", success:" OK ",
};
type FilterLevel = "all" | "info" | "warn" | "error" | "success";

export default function LogPanel() {
  const logs    = useSimStore((s) => s.logs);
  const metrics = useSimStore((s) => s.metrics);
  const packets = useSimStore((s) => s.packets);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterLevel>("all");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [logs.length]);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-panel-edge flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="label-eyebrow">REGISTRO DE EVENTOS</span>
          <span className="font-mono text-[9px] text-white/30">{metrics.processedTotal} procesados</span>
          {packets.length > 0 && (
            <span className="font-mono text-[9px] text-cyan animate-pulse">
              ● {packets.length} en vuelo
            </span>
          )}
        </div>
        {/* Filtros */}
        <div className="flex items-center gap-1">
          {(["all","success","info","warn","error"] as FilterLevel[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm border transition-all ${
                filter === f
                  ? f === "all" ? "border-white/40 text-white/80"
                    : `${LEVEL_COLOR[f] ?? ""} border-current`
                  : "border-transparent text-white/25 hover:text-white/50"
              }`}>
              {f === "all" ? "TODO" : LEVEL_TAG[f]}
            </button>
          ))}
          <span className="w-1.5 h-1.5 rounded-full bg-healthy pulse-glow ml-2" />
        </div>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-1">
        {filtered.length === 0 && (
          <div className="font-mono text-[10px] text-white/20 py-3 text-center">
            Esperando actividad de red...
          </div>
        )}
        <div className="space-y-0.5">
          {filtered.map((log) => (
            <div key={log.id}
              className={`flex gap-2 px-2 py-1 rounded-sm ${LEVEL_BG[log.level] ?? ""}`}>
              <span className="font-mono text-[10px] text-white/25 shrink-0 w-[52px]">{log.timestamp}</span>
              <span className={`font-mono text-[10px] shrink-0 ${LEVEL_COLOR[log.level]}`}>
                [{LEVEL_TAG[log.level]}]
              </span>
              <span className="font-mono text-[10px] text-white/70 leading-tight">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="px-4 py-1 border-t border-panel-edge/50 flex-shrink-0">
        <span className="font-mono text-[8px] text-white/20 tracking-wide">
          ARRASTRA para orbitar 360° · SCROLL para zoom · "CÁMARA AUTO / LIBRE" arriba para controlar el seguimiento
        </span>
      </div>
    </div>
  );
}
