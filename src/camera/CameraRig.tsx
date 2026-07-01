import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useSimStore } from "../store/useStore";
import { packetPosition, packetActive } from "../scene/packetPosition";

const IDLE_TARGET = new THREE.Vector3(0, 1.2, 2);
const IDLE_CAMERA = new THREE.Vector3(16, 10, -3);

export default function CameraRig() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const followCamera = useSimStore((s) => s.followCamera);

  const targetVec = useRef(new THREE.Vector3(0, 1.2, 2));
  const camTargetPos = useRef(new THREE.Vector3(16, 10, -3));
  const desiredCamScratch = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!followCamera) return;

    const focus = packetActive.value ? packetPosition : IDLE_TARGET;

    let desiredCam: THREE.Vector3;
    if (packetActive.value) {
      desiredCam = desiredCamScratch.current.set(focus.x + 9, focus.y + 6.1, focus.z - 7);
    } else {
      desiredCam = IDLE_CAMERA;
    }

    targetVec.current.lerp(focus, 0.07);
    camTargetPos.current.lerp(desiredCam, 0.045);

    camera.position.lerp(camTargetPos.current, 0.05);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetVec.current, 0.09);
      controlsRef.current.update();
    } else {
      camera.lookAt(targetVec.current);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={5}
      maxDistance={45}
      maxPolarAngle={Math.PI - 0.15}
      enableDamping
      dampingFactor={0.08}
    />
  );
}
