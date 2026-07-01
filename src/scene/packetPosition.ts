import * as THREE from "three";

/**
 * Estado compartido fuera de Zustand para que la cámara pueda seguir al
 * paquete en cada frame sin disparar renders de React 60 veces por segundo.
 *
 * Como ahora pueden existir varios paquetes en vuelo a la vez (escenario de
 * sobrecarga), se usa un contador de paquetes activos en vez de un booleano
 * simple, y `primaryPacketId` decide a cuál de ellos sigue la cámara
 * (siempre el más reciente).
 */
export const packetPosition = new THREE.Vector3(0, 1.4, -16);
export const packetActive = { value: false };
export const primaryPacketId: { value: string | null } = { value: null };

let activeCount = 0;

export function registerPacketStart(id: string) {
  activeCount += 1;
  primaryPacketId.value = id;
  packetActive.value = true;
}

export function registerPacketEnd(id: string) {
  activeCount = Math.max(0, activeCount - 1);
  if (activeCount === 0) {
    packetActive.value = false;
    primaryPacketId.value = null;
  }
}
