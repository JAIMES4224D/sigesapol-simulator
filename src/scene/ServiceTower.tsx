import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BaseNode, { statusColor } from "./BaseNode";
import { NodeStatus } from "../store/useStore";

export default function ServiceTower({
  position,
  label,
  sublabel,
  status,
  height = 3.2,
}: {
  position: [number, number, number];
  label: string;
  sublabel?: string;
  status: NodeStatus;
  height?: number;
}) {
  const lightsRef = useRef<THREE.Mesh>(null);
  const color = statusColor(status);

  useFrame(({ clock }) => {
    if (lightsRef.current) {
      const mat = lightsRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(clock.elapsedTime * 3 + position[0]) * 0.3;
    }
  });

  return (
    <BaseNode position={position} label={label} sublabel={sublabel} status={status}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[1.6, height, 1.6]} />
        <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={0.18} />
      </mesh>
      <mesh ref={lightsRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[1.62, height, 0.02]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} toneMapped={false} />
      </mesh>
    </BaseNode>
  );
}
