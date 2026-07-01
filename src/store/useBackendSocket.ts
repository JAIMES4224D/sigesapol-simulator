import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useSimStore, NodeId } from "../store/useStore";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

/**
 * Si VITE_BACKEND_URL está definido, este hook conecta con el backend
 * Node/Express + Socket.io y traduce sus eventos en acciones del store.
 * Si no está definido, la app sigue funcionando 100% en modo simulado
 * (Fase 1), sin requerir backend.
 */
export function useBackendSocket() {
  const startPacket = useSimStore((s) => s.startPacket);
  const setScenario = useSimStore((s) => s.setScenario);
  const addLog = useSimStore((s) => s.addLog);

  useEffect(() => {
    if (!BACKEND_URL) return;

    const socket: Socket = io(BACKEND_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      addLog("success", "Conectado al backend de simulación.");
    });

    socket.on("packet:launch", (payload: { scenario: string; path: NodeId[]; blocked: boolean }) => {
      setScenario(payload.scenario as "normal" | "intrusion" | "overload");
      startPacket(payload.path, payload.blocked);
    });

    socket.on("disconnect", () => {
      addLog("warn", "Desconectado del backend de simulación.");
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
