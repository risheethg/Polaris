import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'primary' | 'secondary' | 'accent' | 'none';
}

export const GlassCard = ({ 
  children, 
  className = '', 
  hover = false,
  glow = 'none'
}: GlassCardProps) => {
  const glowClasses = {
    primary: 'glow-primary',
    secondary: 'glow-secondary',
    accent: 'glow-accent',
    none: ''
  };

  return (
    <div className={cn(
      'glass rounded-2xl p-6 transition-all duration-300',
      hover && 'hover-glow cursor-pointer',
      glowClasses[glow],
      className
    )}>
      {children}
    </div>
  );
};