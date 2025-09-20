import { Html, Line } from '@react-three/drei';
import { CareerStep } from './CareerStep';
import * as THREE from 'three';

interface CareerMapStep {
  step_number: number;
  title: string;
  type: "EXPERIENCE" | "SPECIALIZATION" | "PIVOT";
  duration: string;
  description: string;
  tasks_to_complete: string[];
  next_steps: CareerMapStep[];
}

interface CareerStep3DProps {
  step: CareerMapStep;
  position: THREE.Vector3;
  parentPosition: THREE.Vector3;
}

export const CareerStep3D = ({ step, position, parentPosition }: CareerStep3DProps) => {
  return (
    <group position={position}>
      <Html center>
        <CareerStep step={step} />
      </Html>

      {/* Render line from parent to this step */}
      <Line
        points={[new THREE.Vector3(0, 0, 0), parentPosition.clone().sub(position)]}
        color="hsl(var(--primary))"
        lineWidth={1.5}
        transparent
        opacity={0.25}
      />
    </group>
  );
};