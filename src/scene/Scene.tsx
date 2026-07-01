import { useSimStore } from "../store/useStore";
import Firewall from "./Firewall";
import IDS from "./IDS";
import LoadBalancer from "./LoadBalancer";
import ServiceTower from "./ServiceTower";
import PostgreSQL from "./PostgreSQL";
import { InternetNode, GridFloor } from "./Environment";
import NetworkRoutes from "./NetworkRoutes";
import Packet from "./Packet";
import CameraRig from "../camera/CameraRig";
import Effects from "../effects/Effects";

export default function Scene() {
  const nodes = useSimStore((s) => s.nodes);

  return (
    <>
      <color attach="background" args={["#05070d"]} />
      <fog attach="fog" args={["#05070d", 22, 58]} />

      <ambientLight intensity={0.22} />
      <pointLight position={[0, 12, 0]} intensity={0.55} color="#00f0ff" />
      <directionalLight position={[10, 15, -10]} intensity={0.28} color="#ff2bd6" />

      <GridFloor />
      {/* NetworkRoutes maneja sus propias pairs internamente */}
      <NetworkRoutes />

      <InternetNode position={nodes.internet.position} status={nodes.internet.status} />
      <Firewall     position={nodes.firewall.position} status={nodes.firewall.status} />
      <IDS          position={nodes.ids.position}      status={nodes.ids.status} />
      <LoadBalancer position={nodes.loadbalancer.position} status={nodes.loadbalancer.status} />
      <ServiceTower position={nodes.web01.position}      label="WEB-01"       sublabel="APP SERVER"        status={nodes.web01.status} />
      <ServiceTower position={nodes.web02.position}      label="WEB-02"       sublabel="APP SERVER"        status={nodes.web02.status} />
      <ServiceTower position={nodes.authservice.position} label="AUTH SERVICE" sublabel="IDENTITY PROVIDER" status={nodes.authservice.status} height={2.6} />
      <PostgreSQL   position={nodes.database.position}   status={nodes.database.status} />

      <Packet />
      <CameraRig />
      <Effects />
    </>
  );
}
