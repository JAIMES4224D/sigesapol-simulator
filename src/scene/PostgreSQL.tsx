import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BaseNode, { statusColor } from "./BaseNode";
import { NodeStatus } from "../store/useStore";

export default function PostgreSQL({
  position,
  status,
}: {
  position: [number, number, number];
  status: NodeStatus;
}) {
  const ringsRef = useRef<THREE.Group>(null);
  const color = statusColor(status);

  useFrame((_, delta) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <BaseNode position={position} label="DATABASE VAULT" sublabel="POSTGRESQL CLUSTER" status={status}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 3.2, 24]} />
        <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <group ref={ringsRef} position={[0, 1.6, 0]}>
        {[0.6, 1.4, 2.2].map((y, i) => (
          <mesh key={i} position={[0, y - 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.55, 0.04, 8, 32]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 3.25, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.2, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} toneMapped={false} />
      </mesh>
    </BaseNode>
  );
}
