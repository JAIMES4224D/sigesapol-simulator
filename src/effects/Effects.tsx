import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Postprocesado ligero. El glow es el efecto que más vende visualmente y el
 * que más cuesta en GPU, así que se reduce su costo (sin mipmapBlur, menos
 * muestras) en vez de quitarlo. Chromatic Aberration y el MSAA del
 * EffectComposer se eliminaron porque casi no se notan al lado del costo
 * que añaden — eran la causa principal de la lentitud.
 */
export default function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.3}
        radius={0.5}
        mipmapBlur={false}
      />
      <Vignette eskil={false} offset={0.18} darkness={0.7} />
    </EffectComposer>
  );
}
