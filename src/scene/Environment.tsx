import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NodeLabel, statusColor } from "./BaseNode";
import { NodeStatus } from "../store/useStore";

export function InternetNode({
  position,
  status,
}: {
  position: [number, number, number];
  status: NodeStatus;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const color = statusColor(status);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group position={position}>
      <group ref={groupRef} position={[0, 2.6, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[Math.sin((i * Math.PI * 2) / 3) * 0.6, Math.cos((i * Math.PI * 2) / 3) * 0.3, 0]}
          >
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshStandardMaterial
              color="#0b1220"
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.55}
              wireframe
            />
          </mesh>
        ))}
      </group>
      <NodeLabel position={[0, 0, 0]} label="INTERNET" sublabel="EXTERNAL TRAFFIC" status={status} />
    </group>
  );
}

export function GridFloor() {
  return (
    <group>
      <gridHelper args={[120, 60, "#0aa7b8", "#0e2a3d"]} position={[0, 0, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[140, 140]} />
        <meshBasicMaterial color="#05070d" transparent opacity={0.92} />
      </mesh>
    </group>
  );
}
