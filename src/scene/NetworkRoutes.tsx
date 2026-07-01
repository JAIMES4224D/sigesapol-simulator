import { memo, useMemo } from "react";
import { Line } from "@react-three/drei";
import { NodeId, NODE_POSITIONS } from "../store/useStore";
import { useSimStore } from "../store/useStore";

const ALL_PAIRS: [NodeId, NodeId][] = [
  ["internet","firewall"],["firewall","ids"],["ids","loadbalancer"],
  ["loadbalancer","web01"],["loadbalancer","web02"],
  ["web01","authservice"],["web02","authservice"],["authservice","database"],
];

/**
 * Rutas base: líneas punteadas estáticas que nunca se reconstruyen.
 * Memoizadas fuera del componente que lee el store.
 */
const StaticRoutes = memo(function StaticRoutes() {
  const segments = useMemo(() => ALL_PAIRS.map(([a, b]) => ({
    key: `${a}-${b}`,
    points: [
      [NODE_POSITIONS[a][0], 0.04, NODE_POSITIONS[a][2]],
      [NODE_POSITIONS[b][0], 0.04, NODE_POSITIONS[b][2]],
    ] as [number, number, number][],
  })), []);

  return (
    <group>
      {segments.map((seg) => (
        <Line key={seg.key} points={seg.points}
          color="#0e2a3d" lineWidth={1}
          transparent opacity={0.7}
          dashed dashScale={3} dashSize={0.5} gapSize={0.5}
        />
      ))}
    </group>
  );
});

/**
 * Rutas activas: líneas brillantes que se dibujan encima de las base
 * solo cuando un paquete está recorriendo ese tramo.
 * Este componente SÍ re-renderiza con los paquetes, pero no reconstruye
 * la geometría de las rutas base.
 */
function ActiveRoutes() {
  const packets = useSimStore((s) => s.packets);

  // Construir set de aristas activas con su color de variante
  const activeEdges = useMemo(() => {
    const VARIANT_COLOR: Record<string, string> = {
      cyan: "#00f0ff", magenta: "#ff2bd6", amber: "#ffb800",
    };
    const BLOCKED_COLOR = "#ff3b5c";
    const map = new Map<string, string>();
    packets.forEach((p) => {
      const color = p.blocked ? BLOCKED_COLOR : VARIANT_COLOR[p.variant ?? "cyan"];
      p.path.forEach((_, i) => {
        if (i < p.path.length - 1) {
          const key = `${p.path[i]}-${p.path[i + 1]}`;
          // Si hay varios paquetes en la misma arista, el último gana
          map.set(key, color);
        }
      });
    });
    return map;
  }, [packets]);

  if (activeEdges.size === 0) return null;

  return (
    <group>
      {ALL_PAIRS.filter(([a, b]) => activeEdges.has(`${a}-${b}`)).map(([a, b]) => {
        const color = activeEdges.get(`${a}-${b}`)!;
        const points: [number, number, number][] = [
          [NODE_POSITIONS[a][0], 0.09, NODE_POSITIONS[a][2]],
          [NODE_POSITIONS[b][0], 0.09, NODE_POSITIONS[b][2]],
        ];
        return (
          <Line key={`active-${a}-${b}`} points={points}
            color={color} lineWidth={3}
            transparent opacity={0.9}
            toneMapped={false}
          />
        );
      })}
    </group>
  );
}

export default function NetworkRoutes() {
  return (
    <group>
      {/* Líneas de suelo desactivadas — quitar comentario para reactivar */}
      {/* <StaticRoutes /> */}
      {/* <ActiveRoutes /> */}
    </group>
  );
}
