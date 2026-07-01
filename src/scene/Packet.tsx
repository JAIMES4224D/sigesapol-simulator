import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { useSimStore, PacketState, NODE_POSITIONS } from "../store/useStore";
import { packetPosition, primaryPacketId, registerPacketStart, registerPacketEnd } from "./packetPosition";

const PACKET_PALETTE: Record<"cyan" | "magenta" | "amber", string> = {
  cyan: "#00f0ff",
  magenta: "#ff2bd6",
  amber: "#ffb800",
};
const BLOCKED_COLOR = "#ff3b5c";

/**
 * Una instancia por paquete en vuelo. Cada una construye su propia
 * timeline de GSAP de forma independiente: lanzar un paquete nuevo (por
 * ejemplo en el escenario de sobrecarga, que dispara varios casi a la vez)
 * YA NO mata la animación de los paquetes anteriores. Antes solo existía
 * un único "packet" en el store, así que el segundo y tercer paquete
 * interrumpían al primero a medio camino y dejaban nodos congelados en
 * "PROCESANDO" para siempre.
 */
function SinglePacket({ packet }: { packet: PacketState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const speed             = useSimStore((s) => s.speed);
  const removePacket      = useSimStore((s) => s.removePacket);
  const setNodeStatus     = useSimStore((s) => s.setNodeStatus);
  const addLog            = useSimStore((s) => s.addLog);
  const nodes             = useSimStore((s) => s.nodes);
  const incrementBlocked  = useSimStore((s) => s.incrementBlocked);
  const incrementProcessed= useSimStore((s) => s.incrementProcessed);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const path = packet.path;
    registerPacketStart(packet.id);

    const start = NODE_POSITIONS[path[0]];
    mesh.position.set(start[0], 1.4, start[2]);

    const tl = gsap.timeline({
      onComplete: () => {
        // Asienta el estado final de TODOS los nodos recorridos. Esto es lo
        // que garantiza que el escenario "termine": ningún nodo se queda
        // colgado en "active" — siempre llega a un estado de reposo
        // (healthy) o, si fue bloqueado, a "breached" en el último salto.
        path.forEach((nodeId, idx) => {
          const isLast = idx === path.length - 1;
          if (isLast && packet.blocked) {
            setNodeStatus(nodeId, "breached");
          } else {
            setNodeStatus(nodeId, "healthy");
          }
        });
        if (packet.blocked) {
          incrementBlocked();
          const label = nodes[path[path.length - 1]]?.label ?? "FIREWALL";
          addLog("error", `Conexión bloqueada en ${label}.`);
        } else {
          incrementProcessed();
        }
        removePacket(packet.id);
      },
    });

    for (let i = 0; i < path.length - 1; i++) {
      const fromPos = NODE_POSITIONS[path[i]];
      const toPos = NODE_POSITIONS[path[i + 1]];
      const isLastHop = i === path.length - 2;
      const blockedHere = packet.blocked && isLastHop;

      tl.to(mesh.position, {
        x: toPos[0],
        y: 1.4,
        z: blockedHere ? (fromPos[2] + toPos[2]) / 2 : toPos[2],
        duration: 1.1 / speed,
        ease: "power2.inOut",
        onStart: () => setNodeStatus(path[i], "active"),
        onComplete: () => {
          if (blockedHere) {
            setNodeStatus(path[i + 1], "breached");
            if (materialRef.current) {
              gsap.to(materialRef.current.color, { r: 1, g: 0.23, b: 0.36, duration: 0.2 });
            }
            gsap.fromTo(
              mesh.scale,
              { x: 1, y: 1, z: 1 },
              { x: 0.2, y: 0.2, z: 0.2, duration: 0.4, ease: "power3.out" }
            );
          } else {
            setNodeStatus(path[i + 1], isLastHop ? "healthy" : "active");
          }
        },
      });

      tl.to(mesh.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.18 / speed, ease: "power1.inOut" });
      tl.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.18 / speed, ease: "power1.inOut" });
    }

    return () => {
      tl.kill();
      registerPacketEnd(packet.id);
    };
    // Se construye una sola vez por instancia de paquete; `packet.id` es
    // estable durante toda su vida (no se reconstruye si cambia speed).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 4;
      if (primaryPacketId.value === packet.id) {
        packetPosition.copy(meshRef.current.position);
      }
    }
  });

  const color = packet.blocked ? BLOCKED_COLOR : PACKET_PALETTE[packet.variant ?? "cyan"];

  return (
    <Trail width={2.5} length={6} color={color} attenuation={(t) => t * t}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshBasicMaterial ref={materialRef} color={color} toneMapped={false} />
      </mesh>
    </Trail>
  );
}

export default function PacketSwarm() {
  const packets = useSimStore((s) => s.packets);
  return (
    <>
      {packets.map((p) => (
        <SinglePacket key={p.id} packet={p} />
      ))}
    </>
  );
}
