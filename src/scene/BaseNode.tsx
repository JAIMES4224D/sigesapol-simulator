import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { NodeStatus } from "../store/useStore";

const STATUS_COLOR: Record<NodeStatus, string> = {
  idle: "#0aa7b8",
  active: "#00f0ff",
  warning: "#ffb800",
  breached: "#ff3b5c",
  healthy: "#19ffb0",
};

interface BaseNodeProps {
  position: [number, number, number];
  label: string;
  sublabel?: string;
  status: NodeStatus;
  children: React.ReactNode;
}

export function NodeLabel({
  position,
  label,
  sublabel,
  status,
}: {
  position: [number, number, number];
  label: string;
  sublabel?: string;
  status: NodeStatus;
}) {
  const color = STATUS_COLOR[status];
  return (
    <Html
      position={[position[0], position[1] + 3.4, position[2]]}
      center
      distanceFactor={16}
      zIndexRange={[1, 0]}
    >
      <div className="flex flex-col items-center pointer-events-none select-none">
        <div
          className="font-display text-[11px] tracking-widest uppercase px-2 py-0.5 rounded-sm whitespace-nowrap"
          style={{
            color,
            background: "rgba(5,7,13,0.7)",
            border: `1px solid ${color}55`,
            textShadow: `0 0 8px ${color}`,
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div className="font-mono text-[8px] tracking-wider text-cyan-dim mt-0.5 opacity-80">
            {sublabel}
          </div>
        )}
      </div>
    </Html>
  );
}

export function StatusRing({
  radius,
  status,
}: {
  radius: number;
  status: NodeStatus;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const color = STATUS_COLOR[status];

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * (status === "breached" ? 2.2 : 0.4);
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[radius, radius + 0.12, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} />
    </mesh>
  );
}

export function statusColor(status: NodeStatus) {
  return STATUS_COLOR[status];
}

export default function BaseNode({ position, label, sublabel, status, children }: BaseNodeProps) {
  return (
    <group position={position}>
      {children}
      <StatusRing radius={2.1} status={status} />
      <NodeLabel position={[0, 0, 0]} label={label} sublabel={sublabel} status={status} />
    </group>
  );
}
