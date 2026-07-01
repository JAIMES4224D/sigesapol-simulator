import { create } from "zustand";

export type NodeStatus = "idle" | "active" | "warning" | "breached" | "healthy";

export type NodeId =
  | "internet"
  | "firewall"
  | "ids"
  | "loadbalancer"
  | "web01"
  | "web02"
  | "authservice"
  | "database";

export interface NetworkNode {
  id: NodeId;
  label: string;
  kind: "gateway" | "security" | "balancer" | "service" | "data";
  position: [number, number, number];
  status: NodeStatus;
  cpu: number;    // 0-100
  memory: number; // 0-100
  uptime: number; // seconds
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

export interface PacketState {
  id: string;
  path: NodeId[];
  blocked: boolean;
  variant?: "cyan" | "magenta" | "amber";
}

export type ScenarioId = "normal" | "intrusion" | "overload" | "ddos" | "failover";

export type SystemStatus = "OPERACIÓN ESTABLE" | "ALERTA ACTIVA" | "BAJO ATAQUE" | "FAILOVER ACTIVO" | "SOBRECARGA";

export interface LiveMetrics {
  threatLevel: number;    // 0-100 %
  load: number;           // 0-100 %
  blockedCount: number;
  latencyMs: number;
  packetsPerSec: number;
  processedTotal: number;
  systemStatus: SystemStatus;
  uptime: number; // seconds since session start
}

interface SimulationState {
  nodes: Record<NodeId, NetworkNode>;
  packets: PacketState[];
  logs: LogEntry[];
  speed: number;
  followCamera: boolean;
  scenario: ScenarioId;
  metrics: LiveMetrics;

  setNodeStatus: (id: NodeId, status: NodeStatus) => void;
  setNodeMetrics: (id: NodeId, cpu: number, memory: number) => void;
  startPacket: (path: NodeId[], blocked?: boolean, variant?: PacketState["variant"]) => string;
  removePacket: (id: string) => void;
  addLog: (level: LogEntry["level"], message: string) => void;
  setSpeed: (speed: number) => void;
  toggleCamera: () => void;
  setScenario: (s: ScenarioId) => void;
  updateMetrics: (patch: Partial<LiveMetrics>) => void;
  incrementBlocked: () => void;
  incrementProcessed: () => void;
  resetAllStatuses: () => void;
  tickUptime: () => void;
}

function makeNode(
  id: NodeId,
  label: string,
  kind: NetworkNode["kind"],
  position: [number, number, number]
): NetworkNode {
  return { id, label, kind, position, status: "idle", cpu: 0, memory: 0, uptime: 0 };
}

const initialNodes: Record<NodeId, NetworkNode> = {
  internet:     makeNode("internet",     "INTERNET",       "gateway",  [0,  0, -16]),
  firewall:     makeNode("firewall",     "FIREWALL",       "security", [0,  0, -10]),
  ids:          makeNode("ids",          "IDS / IPS",      "security", [0,  0, -4]),
  loadbalancer: makeNode("loadbalancer", "LOAD BALANCER",  "balancer", [0,  0, 2]),
  web01:        makeNode("web01",        "WEB-01",         "service",  [-4, 0, 8]),
  web02:        makeNode("web02",        "WEB-02",         "service",  [4,  0, 8]),
  authservice:  makeNode("authservice",  "AUTH SERVICE",   "service",  [0,  0, 13]),
  database:     makeNode("database",     "DATABASE VAULT", "data",     [0,  0, 19]),
};

let logCounter = 0;
const SESSION_START = Date.now();

export const NODE_POSITIONS: Record<NodeId, [number, number, number]> = Object.fromEntries(
  (Object.keys(initialNodes) as NodeId[]).map((id) => [id, initialNodes[id].position])
) as Record<NodeId, [number, number, number]>;

export const useSimStore = create<SimulationState>((set, get) => ({
  nodes: initialNodes,
  packets: [],
  logs: [],
  speed: 1,
  followCamera: true,
  scenario: "normal",
  metrics: {
    threatLevel: 3,
    load: 5,
    blockedCount: 0,
    latencyMs: 8,
    packetsPerSec: 0,
    processedTotal: 0,
    systemStatus: "OPERACIÓN ESTABLE",
    uptime: 0,
  },

  setNodeStatus: (id, status) =>
    set((s) => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], status } } })),

  setNodeMetrics: (id, cpu, memory) =>
    set((s) => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], cpu, memory } } })),

  startPacket: (path, blocked = false, variant) => {
    const id = crypto.randomUUID();
    set((s) => ({ packets: [...s.packets, { id, path, blocked, variant }] }));
    return id;
  },

  removePacket: (id) =>
    set((s) => ({ packets: s.packets.filter((p) => p.id !== id) })),

  addLog: (level, message) => {
    logCounter += 1;
    const entry: LogEntry = {
      id: `log-${logCounter}`,
      timestamp: new Date().toLocaleTimeString("es-PE", { hour12: false }),
      level,
      message,
    };
    set((s) => ({ logs: [entry, ...s.logs].slice(0, 120) }));
  },

  setSpeed: (speed) => set({ speed }),
  toggleCamera: () => set((s) => ({ followCamera: !s.followCamera })),
  setScenario: (scenario) => set({ scenario }),
  updateMetrics: (patch) => set((s) => ({ metrics: { ...s.metrics, ...patch } })),

  incrementBlocked: () =>
    set((s) => ({
      metrics: { ...s.metrics, blockedCount: s.metrics.blockedCount + 1 },
    })),

  incrementProcessed: () =>
    set((s) => ({
      metrics: { ...s.metrics, processedTotal: s.metrics.processedTotal + 1 },
    })),

  tickUptime: () =>
    set((s) => ({
      metrics: { ...s.metrics, uptime: Math.floor((Date.now() - SESSION_START) / 1000) },
    })),

  resetAllStatuses: () =>
    set((s) => {
      const reset: Record<NodeId, NetworkNode> = { ...s.nodes };
      (Object.keys(reset) as NodeId[]).forEach((k) => {
        reset[k] = { ...reset[k], status: "idle", cpu: 0, memory: 0 };
      });
      return { nodes: reset, packets: [] };
    }),
}));
