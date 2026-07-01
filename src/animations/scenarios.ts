import { useSimStore, NodeId, NodeStatus, ScenarioId } from "../store/useStore";

export type PacketVariant = "cyan" | "magenta" | "amber";

type ScenarioStep = {
  path: NodeId[];
  blocked?: boolean;
  variant?: PacketVariant;
  delayBefore?: number; 
};

interface ScenarioConfig {
  steps: ScenarioStep[];
  
  presetStatuses?: Partial<Record<NodeId, NodeStatus>>;
  logs: Array<{ level: "info" | "warn" | "error" | "success"; message: string }>;
}

const FULL_WEB01: NodeId[] = ["internet", "firewall", "ids", "loadbalancer", "web01", "authservice", "database"];
const FULL_WEB02: NodeId[] = ["internet", "firewall", "ids", "loadbalancer", "web02", "authservice", "database"];

const SCENARIOS: Record<ScenarioId, ScenarioConfig> = {
  normal: {
    steps: [{ path: FULL_WEB01, variant: "cyan" }],
    logs: [{ level: "success", message: "Solicitud legítima autenticada. Acceso concedido a DATABASE VAULT." }],
  },

  intrusion: {
    steps: [{ path: ["internet", "firewall"], blocked: true, variant: "magenta" }],
    logs: [
      { level: "warn", message: "Paquete con firma anómala detectado desde origen externo." },
      { level: "error", message: "FIREWALL: regla DROP aplicada. Conexión rechazada." },
    ],
  },


  overload: {
    steps: [
      { path: FULL_WEB01, variant: "cyan" },
      { path: FULL_WEB02, variant: "magenta", delayBefore: 160 },
      { path: FULL_WEB01, variant: "amber", delayBefore: 160 },
      { path: FULL_WEB02, variant: "cyan", delayBefore: 160 },
      { path: FULL_WEB01, variant: "magenta", delayBefore: 160 },
      { path: FULL_WEB02, variant: "amber", delayBefore: 160 },
      { path: FULL_WEB01, variant: "cyan", delayBefore: 220 },
      { path: FULL_WEB02, variant: "magenta", delayBefore: 160 },
    ],
    logs: [
      { level: "info", message: "Ráfaga de tráfico entrante. LOAD BALANCER distribuyendo carga." },
      { level: "warn", message: "WEB-01 al 87% de capacidad. Redirigiendo tráfico a WEB-02." },
      { level: "info", message: "8 conexiones simultáneas en curso hacia DATABASE VAULT." },
    ],
  },

  
  ddos: {
    presetStatuses: { firewall: "warning" },
    steps: Array.from({ length: 10 }, (_, i) => ({
      path: ["internet", "firewall"] as NodeId[],
      blocked: true,
      variant: "magenta" as PacketVariant,
      delayBefore: i === 0 ? 0 : 90,
    })),
    logs: [
      { level: "error", message: "ALERTA: ráfaga masiva detectada desde múltiples IPs de origen." },
      { level: "warn", message: "Posible ataque de Denegación de Servicio (DDoS) en curso." },
      { level: "error", message: "FIREWALL aplicando rate-limiting y bloqueo de IPs maliciosas." },
    ],
  },


  failover: {
    presetStatuses: { web01: "warning" },
    steps: [
      { path: FULL_WEB02, variant: "cyan" },
      { path: FULL_WEB02, variant: "cyan", delayBefore: 260 },
      { path: FULL_WEB02, variant: "cyan", delayBefore: 260 },
      { path: FULL_WEB02, variant: "cyan", delayBefore: 260 },
    ],
    logs: [
      { level: "warn", message: "WEB-01 entra en mantenimiento programado." },
      { level: "info", message: "LOAD BALANCER redirige el 100% del tráfico a WEB-02." },
      { level: "success", message: "Servicio mantenido sin interrupciones (alta disponibilidad)." },
    ],
  },
};

export function getScenarioConfig(scenario: ScenarioId): ScenarioConfig {
  return SCENARIOS[scenario];
}

export function applyPresetStatuses(scenario: ScenarioId) {
  const preset = SCENARIOS[scenario].presetStatuses;
  if (!preset) return;
  const { setNodeStatus } = useSimStore.getState();
  (Object.keys(preset) as NodeId[]).forEach((nodeId) => {
    setNodeStatus(nodeId, preset[nodeId]!);
  });
}

export function logForScenario(scenario: ScenarioId) {
  const { addLog } = useSimStore.getState();
  SCENARIOS[scenario].logs.forEach((entry) => addLog(entry.level, entry.message));
}
export function getScenarioSteps(scenario: ScenarioId) {
  return SCENARIOS[scenario].steps;
}
