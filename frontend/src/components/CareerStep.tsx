import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Step {
  step_number: number;
  title: string;
  type: 'EXPERIENCE' | 'SPECIALIZATION' | 'PIVOT';
  duration: string;
  description: string;
  tasks_to_complete: string[];
  next_steps: Step[];
}

const stepColors = {
  EXPERIENCE: '#5DADE2', // tech blue
  SPECIALIZATION: '#AF7AC5', // creative purple
  PIVOT: '#48C9B0', // science teal
}

const Star = ({ position, color }: { position: [number, number, number], color: string }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(time * 2) * 0.15;
      ref.current.scale.set(scale, scale, scale);
    }
  });
  return (
    <mesh position={position} ref={ref}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
  )
}

export const CareerStep = ({ step, position = [0, 0, 0] }: { step: Step, position?: [number, number, number] }) => {
  const color = stepColors[step.type] || '#F5B041';
  const yOffset = 6;
  const xSpread = 8;

  return (
    <group position={position}>
      <Star position={[0, 0, 0]} color={color} />
      <Text
        position={[0, -0.8, 0]}
        color="white"
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
        maxWidth={5}
        textAlign="center"
      >
        {step.title}
      </Text>
      <Text
        position={[0, -1.4, 0]}
        color="hsl(var(--muted-foreground))"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {step.duration}
      </Text>
      {step.next_steps && step.next_steps.length > 0 && (
        step.next_steps.map((nextStep, index) => {
          const totalWidth = (step.next_steps.length - 1) * xSpread;
          const nextX = index * xSpread - totalWidth / 2;
          const nextY = yOffset;
          return (
            <group key={index}>
              <Line points={[[0, 0, 0], [nextX, nextY, 0]]} color="white" lineWidth={0.5} dashed dashSize={0.5} gapSize={0.5} />
              <CareerStep step={nextStep} position={[nextX, nextY, 0]} />
            </group>
          )
        })
      )}
    </group>
  );
};