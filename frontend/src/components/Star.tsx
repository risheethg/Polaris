import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface StarProps {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  label: string;
  pulsing?: boolean;
  onClick: (id: string) => void;
}

export const Star = ({ id, position, color, size, label, pulsing = false, onClick }: StarProps) => {
  const ref = useRef<THREE.Mesh>(null!);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useFrame((state, delta) => {
    if (pulsing) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.scale.set(scale, scale, scale);
    } else {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  const handlePointerOver = () => setIsHovered(true);
  const handlePointerOut = () => setIsHovered(false);
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
        <meshStandardMaterial color={isHovered ? 'white' : color} emissive={color} emissiveIntensity={isHovered ? 2 : 1} toneMapped={false} />
      </Sphere>
      {(isHovered || isActive) && <Text position={[0, size + 0.5, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">{label}</Text>}
    </group>
  );
};