import { motion } from 'framer-motion';
import { CheckCircle, Rocket, Sparkles, Orbit, Star } from 'lucide-react';

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
  EXPERIENCE: { icon: <Rocket className="h-5 w-5 text-secondary" />, color: 'border-secondary' },
  SPECIALIZATION: { icon: <Sparkles className="h-5 w-5 text-primary" />, color: 'border-primary' },
  PIVOT: { icon: <Orbit className="h-5 w-5 text-accent" />, color: 'border-accent' },
};

export const CareerStep = ({ step, isFirst = false }: { step: Step; isFirst?: boolean }) => {
  const { icon, color } = typeStyles[step.type] || typeStyles.EXPERIENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative pl-8 ${!isFirst ? 'mt-8' : ''}`}
    >
      {!isFirst && (
        <div className="absolute left-0 top-4 h-full w-px bg-gradient-to-b from-border/50 via-border to-border/50 -translate-x-px"></div>
      )}
      <div className="absolute left-0 top-4 -translate-x-1/2">
        <Star className="h-4 w-4 text-primary/70 fill-current" />
      </div>
      <div className={`p-6 rounded-lg border-l-4 bg-card/50 shadow-lg shadow-black/20 ${color}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl font-bold font-heading">{step.title}</h2>
          </div>
          <div className="text-sm text-muted-foreground font-mono">{step.duration}</div>
        </div>

        <p className="text-muted-foreground mb-6">{step.description}</p>

        <div>
          <h3 className="font-semibold mb-3">Key Milestones:</h3>
          <ul className="space-y-2">
            {step.tasks_to_complete.map((task, index) => (
              <li key={index} className="flex items-start gap-3 text-muted-foreground/80">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {step.next_steps && step.next_steps.length > 0 && (
        <div className="mt-8 pl-10 border-l border-dashed border-border/50 ml-[1px]">
          {step.next_steps.map((nextStep, index) => (
            <CareerStep key={index} step={nextStep} />
          ))}
        </div>
      )}
    </motion.div>
  );
};