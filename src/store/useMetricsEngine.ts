import { useEffect, useRef } from "react";
import { useSimStore, NodeId, SystemStatus } from "./useStore";

/**
 * Motor de métricas en tiempo real.
 * Corre en background cada ~900ms y actualiza:
 *  - Latencia (ms) con jitter realista según escenario
 *  - Carga global (%) según paquetes activos
 *  - Nivel de amenaza (%) según escenario
 *  - CPU/memoria por nodo
 *  - packetsPerSec
 *  - Estado del sistema
 *  - Uptime de sesión
 */
export function useMetricsEngine() {
  const pktHistory = useRef<number[]>([]);
  const tick = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tick.current += 1;
      const store = useSimStore.getState();
      const { scenario, packets, metrics, setNodeMetrics, updateMetrics, tickUptime } = store;
      const activePkts = packets.length;

      // Registrar cuántos paquetes había en este tick para calcular pkt/s
      pktHistory.current.push(activePkts);
      if (pktHistory.current.length > 5) pktHistory.current.shift();
      const pps = Math.round(
        pktHistory.current.reduce((a, b) => a + b, 0) / pktHistory.current.length * 1.1
      );

      // ─── Parámetros base según escenario ───────────────────────────────
      const baseLatency: Record<string, number> = {
        normal: 8, intrusion: 22, overload: 55, ddos: 180, failover: 14,
      };
      const baseThreat: Record<string, number> = {
        normal: 3, intrusion: 68, overload: 18, ddos: 97, failover: 12,
      };
      const baseLoad: Record<string, number> = {
        normal: 8, intrusion: 12, overload: 78, ddos: 60, failover: 55,
      };
      const sysStatus: Record<string, SystemStatus> = {
        normal: "OPERACIÓN ESTABLE",
        intrusion: "ALERTA ACTIVA",
        overload: "SOBRECARGA",
        ddos: "BAJO ATAQUE",
        failover: "FAILOVER ACTIVO",
      };

      const jitter = () => (Math.random() - 0.5) * 8;
      const noise = (base: number, range: number) =>
        Math.min(100, Math.max(0, base + (Math.random() - 0.5) * range));

      const latencyMs = Math.max(1, Math.round(
        (baseLatency[scenario] ?? 8) + (activePkts > 0 ? activePkts * 4 : 0) + jitter()
      ));
      const threatLevel = Math.round(noise(baseThreat[scenario] ?? 3, 6) + (activePkts > 2 ? 8 : 0));
      const load = Math.round(noise(baseLoad[scenario] ?? 8, 10) + activePkts * 5);

      updateMetrics({
        latencyMs,
        threatLevel: Math.min(100, threatLevel),
        load: Math.min(100, load),
        packetsPerSec: pps,
        systemStatus: sysStatus[scenario] ?? "OPERACIÓN ESTABLE",
      });

      tickUptime();

      // ─── CPU / Memoria por nodo ─────────────────────────────────────────
      const nodeCPUBase: Record<string, number> = {
        normal:    { firewall:12, ids:8,  loadbalancer:10, web01:18, web02:12, authservice:14, database:9 },
        intrusion: { firewall:78, ids:65, loadbalancer:10, web01:8,  web02:8,  authservice:10, database:5 },
        overload:  { firewall:45, ids:40, loadbalancer:88, web01:82, web02:79, authservice:70, database:68 },
        ddos:      { firewall:95, ids:88, loadbalancer:15, web01:10, web02:10, authservice:8,  database:5 },
        failover:  { firewall:20, ids:18, loadbalancer:72, web01:0,  web02:92, authservice:65, database:60 },
      }[scenario] ?? {};

      (Object.keys(nodeCPUBase) as NodeId[]).forEach((nid) => {
        const base = nodeCPUBase[nid] ?? 5;
        const cpu = Math.min(100, Math.max(0, Math.round(noise(base, 8))));
        const mem = Math.min(100, Math.max(0, Math.round(noise(base * 0.75, 10))));
        setNodeMetrics(nid, cpu, mem);
      });
    }, 900);

    return () => clearInterval(interval);
  }, []);
}
