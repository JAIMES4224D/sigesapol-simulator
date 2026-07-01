import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./scene/Scene";
import TopBar from "./ui/TopBar";
import LeftPanel from "./ui/LeftPanel";
import StatusPanel from "./ui/StatusPanel";
import LogPanel from "./ui/LogPanel";
import { useBackendSocket } from "./store/useBackendSocket";
import { useMetricsEngine } from "./store/useMetricsEngine";

function Loader() {
  return (
    <div className="inset-0 flex flex-col items-center justify-center gap-3 bg-void w-full h-full">
      <div className="w-10 h-10 rounded-full border border-cyan/30 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-t border-cyan animate-spin" />
      </div>
      <div className="font-mono text-cyan text-[11px] tracking-[0.3em] animate-pulse">
        INICIALIZANDO RED...
      </div>
    </div>
  );
}

function EngineHooks() {
  useBackendSocket();
  useMetricsEngine();
  return null;
}

/**
 * Layout en grid real — ningún panel sobrepone al canvas.
 * El canvas ocupa el espacio central restante después de que los
 * sidebars y el log reservan su espacio propio.
 *
 *  ┌─────────────────────────────── TopBar ───────────────────────────────┐
 *  │  LeftPanel (160px) │  Canvas (flex-1)  │  StatusPanel (262px)        │
 *  │                    │                   │                              │
 *  └────────────────────┴─── LogPanel (full width, 168px tall) ───────────┘
 */
export default function App() {
  return (
    <div className="w-screen h-screen bg-void flex flex-col overflow-hidden">
      <EngineHooks />

      {/* ── Top bar ── */}
      <TopBar />

      {/* ── Main content row ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left sidebar */}
        <div className="w-44 flex-shrink-0 flex flex-col gap-2 p-2 overflow-y-auto border-r border-panel-edge">
          <LeftPanel />
        </div>

        {/* 3D Canvas — fills remaining width */}
        <div className="flex-1 relative min-w-0">
          <Suspense fallback={<Loader />}>
            <Canvas
              camera={{ position: [16, 10, -3], fov: 48, near: 0.1, far: 200 }}
              gl={{ antialias: true, powerPreference: "high-performance" }}
              dpr={[1, 1.5]}
              performance={{ min: 0.5 }}
              style={{ width: "100%", height: "100%" }}
            >
              <Scene />
            </Canvas>
          </Suspense>
        </div>

        {/* Right sidebar */}
        <div className="w-64 flex-shrink-0 overflow-y-auto border-l border-panel-edge">
          <StatusPanel />
        </div>
      </div>

      {/* ── Bottom log bar ── */}
      <div className="h-44 flex-shrink-0 border-t border-panel-edge">
        <LogPanel />
      </div>
    </div>
  );
}
