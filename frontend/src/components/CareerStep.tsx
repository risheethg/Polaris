import { motion } from 'framer-motion';
import { CheckCircle, Rocket, Sparkles, Orbit, Star, GitBranch } from 'lucide-react';

interface Step {
  step_number: number;
  title: string;
  type: 'EXPERIENCE' | 'SPECIALIZATION' | 'PIVOT';
  duration: string;
  description: string;
  tasks_to_complete: string[];
  next_steps: Step[];
}

const typeStyles = {
  EXPERIENCE: { icon: <Rocket className="h-5 w-5 text-secondary" />, color: 'border-secondary/50' },
  SPECIALIZATION: { icon: <Sparkles className="h-5 w-5 text-primary" />, color: 'border-primary/50' },
  PIVOT: { icon: <GitBranch className="h-5 w-5 text-accent" />, color: 'border-accent/50' },
};

export const CareerStep = ({ step, isFirst = false }: { step: Step; isFirst?: boolean }) => {
  const { icon, color } = typeStyles[step.type] || typeStyles.EXPERIENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative flex flex-col items-center"
    >
      {/* The star representing this career step */}
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background ring-2 ring-primary/30">
        <Star className="h-6 w-6 text-primary/80 fill-current" />
      </div>

      {/* The card with details for this step */}
      <div className={`mt-4 w-full max-w-sm rounded-xl border bg-card/50 p-6 text-center shadow-lg shadow-black/20 ${color}`}>
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

      {step.next_steps && step.next_steps.length > 0 && (
        <>
          {/* Vertical line going up to the branching point */}
          <div className="mt-4 h-16 w-px bg-gradient-to-b from-primary/30 to-primary/10"></div>

          {/* Container for the next steps, arranged horizontally */}
          <div className="relative flex w-full justify-center">
            {/* Horizontal line connecting the branches */}
            {step.next_steps.length > 1 && (
              <div className="absolute top-6 h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            )}
            <div className="flex w-full justify-around gap-8">
              {step.next_steps.map((nextStep, index) => (
                <CareerStep key={index} step={nextStep} />
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};