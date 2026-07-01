import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BaseNode, { statusColor } from "./BaseNode";
import { NodeStatus } from "../store/useStore";

export default function IDS({
  position,
  status,
}: {
  position: [number, number, number];
  status: NodeStatus;
}) {
  const beamRef = useRef<THREE.Mesh>(null);
  const color = statusColor(status);

  useFrame((_, delta) => {
    if (beamRef.current) {
      beamRef.current.rotation.y += delta * 1.6;
    }
  });

  return (
    <BaseNode position={position} label="IDS / IPS" sublabel="DEEP PACKET SCAN" status={status}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 2.8, 8]} />
        <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 2.9, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <mesh ref={beamRef} position={[0, 2.9, 0]}>
        <coneGeometry args={[2.6, 0.05, 24, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </BaseNode>
  );
}
