export default function FooterHint() {
  return (
    <div className="absolute bottom-4 right-4 z-50 panel rounded-md px-3 py-2 pointer-events-none">
      <p className="font-mono text-[10px] text-white/40 tracking-wide">
        ARRASTRA para orbitar 360° · SCROLL para zoom · Usa "Cámara libre" (arriba) para que la cámara automática deje de seguir al paquete
      </p>
    </div>
  );
}
