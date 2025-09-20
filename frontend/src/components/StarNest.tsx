import { useRef } from 'react';
import { shaderMaterial, Plane } from '@react-three/drei';
import { extend, useFrame, useThree, ShaderMaterialProps } from '@react-three/fiber';
import * as THREE from 'three';

import vertexShader from '@/shaders/starNest.vert';
import fragmentShader from '@/shaders/starNest.frag';

const StarNestMaterial = shaderMaterial(
  {
    u_time: 0,
    u_resolution: new THREE.Vector2(),
    u_mouse: new THREE.Vector2(),
  },
  vertexShader,
  fragmentShader
);

extend({ StarNestMaterial });

// For TypeScript: Define the custom material as a JSX element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      starNestMaterial: ShaderMaterialProps & { u_time?: number; u_resolution?: THREE.Vector2; u_mouse?: THREE.Vector2; };
    }
  }
}

export const StarNest = () => {
  const materialRef = useRef<any>();
  const { size, mouse } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.u_time = state.clock.getElapsedTime();
      materialRef.current.u_resolution.x = size.width;
      materialRef.current.u_resolution.y = size.height;
      materialRef.current.u_mouse.x = mouse.x * 0.5 * size.width;
      materialRef.current.u_mouse.y = mouse.y * 0.5 * size.height;
    }
  });

  return (
    <Plane args={[2, 2]} position={[0, 0, -10]}>
      <starNestMaterial ref={materialRef} />
    </Plane>
  );
};