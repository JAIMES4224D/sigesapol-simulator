import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";


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
