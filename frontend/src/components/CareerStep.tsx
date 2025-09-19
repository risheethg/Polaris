import { motion } from 'framer-motion';
import { CheckCircle, Rocket, Sparkles, GitBranch, Star } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative flex flex-col items-center"
    >
      {/* The card with details for this step */}
      <div className={`w-80 rounded-xl border bg-card/80 p-6 text-center shadow-lg shadow-black/20 ${color} backdrop-blur-sm`}>
        <div className="mb-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl font-bold font-heading">{step.title}</h2>
          </div>
          <div className="text-sm text-muted-foreground font-mono">{step.duration}</div>
        </div>

        <p className="mb-6 text-muted-foreground">{step.description}</p>

        <div>
          <h3 className="mb-3 font-semibold">Key Milestones:</h3>
          <ul className="space-y-2">
            {step.tasks_to_complete.map((task, index) => (
              <li key={index} className="flex items-start gap-3 text-left text-muted-foreground/80">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};