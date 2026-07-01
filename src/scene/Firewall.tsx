import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BaseNode, { statusColor } from "./BaseNode";
import { NodeStatus } from "../store/useStore";

export default function Firewall({
  position,
  status,
}: {
  position: [number, number, number];
  status: NodeStatus;
}) {
  const wallRef = useRef<THREE.Mesh>(null);
  const color = statusColor(status);

  useFrame(({ clock }) => {
    if (wallRef.current) {
      const mat = wallRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(clock.elapsedTime * 2.4) * 0.15;
    }
  });

  return (
    <BaseNode position={position} label="FIREWALL" sublabel="L3/L4 FILTER" status={status}>
      {/* base structure */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[3.6, 1.8, 0.6]} />
        <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {/* energy wall (the "filter") */}
      <mesh ref={wallRef} position={[0, 2.0, 0]}>
        <planeGeometry args={[3.8, 2.6]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* vertical struts */}
      {[-1.7, 1.7].map((x) => (
        <mesh key={x} position={[x, 2.0, 0]}>
          <boxGeometry args={[0.12, 2.8, 0.12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
    </BaseNode>
  );
}
