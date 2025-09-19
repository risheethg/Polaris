import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface StarProps {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  label: string;
  pulsing?: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
}

export const Star = ({ id, position, color, size, label, pulsing = false, onClick, onHover }: StarProps) => {
  const ref = useRef<THREE.Mesh>(null!);
  const [isHovered, setIsHovered] = useState(false); // This will be used for interaction feedback
  const [isActive, setIsActive] = useState(false);

  useFrame((state, delta) => {
    if (pulsing) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.scale.set(scale, scale, scale);
    } else {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    onHover(id);
  };
  const handlePointerOut = () => {
    setIsHovered(false);
    onHover(null);
  };
  const handleClick = () => {
    setIsActive(true);
    onClick(id);
  };

  return (
    <group position={position}>
      <Sphere
        ref={ref}
        args={[size, 32, 32]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshStandardMaterial color={isHovered ? 'white' : color} emissive={color} emissiveIntensity={isHovered || pulsing ? 1.5 : 0.5} toneMapped={false} />
      </Sphere>
      <Html distanceFactor={10}>
        <div className={`transition-opacity duration-300 pointer-events-none ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}`}>
          <div className="px-2 py-1 text-xs text-white bg-black/50 rounded-md whitespace-nowrap -translate-x-1/2 -translate-y-8">{label}</div>
        </div>
      </Html>
    </group>
  );
};