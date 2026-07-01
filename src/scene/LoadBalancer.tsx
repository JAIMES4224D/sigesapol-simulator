import BaseNode, { statusColor } from "./BaseNode";
import { NodeStatus } from "../store/useStore";

export default function LoadBalancer({
  position,
  status,
}: {
  position: [number, number, number];
  status: NodeStatus;
}) {
  const color = statusColor(status);

  return (
    <BaseNode position={position} label="LOAD BALANCER" sublabel="TRAFFIC DISTRIBUTOR" status={status}>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.5, 24]} />
        <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 1.2, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {/* split arms toward web01/web02 */}
      {[-1, 1].map((dir) => (
        <mesh
          key={dir}
          position={[dir * 1.1, 1.1, 1.3]}
          rotation={[0, dir * 0.5, 0]}
        >
          <boxGeometry args={[0.1, 0.1, 2.4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      ))}
    </BaseNode>
  );
}
