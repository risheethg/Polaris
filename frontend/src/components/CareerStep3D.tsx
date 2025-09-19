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
}

const ySpacing = -75;
const xSpacing = 45;

export const CareerStep3D = ({ step, position }: CareerStep3DProps) => {
  const nextStepPositions = step.next_steps.map((_, index) => {
    const numSteps = step.next_steps.length;
    const xOffset = (index - (numSteps - 1) / 2) * xSpacing;
    return new THREE.Vector3(position.x + xOffset, position.y + ySpacing, position.z);
  });

  return (
    <group position={position}>
      <Html center>
        <CareerStep step={step} />
      </Html>

      {/* Render lines to next steps */}
      {nextStepPositions.map((nextPos, index) => (
        <Line
          key={index}
          points={[new THREE.Vector3(0, 0, 0), nextPos.clone().sub(position)]}
          color="hsl(var(--primary))"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}

      {/* Recursively render next steps */}
      {step.next_steps.map((nextStep, index) => (
        <CareerStep3D key={index} step={nextStep} position={nextStepPositions[index].clone().sub(position)} />
      ))}
    </group>
  );
};