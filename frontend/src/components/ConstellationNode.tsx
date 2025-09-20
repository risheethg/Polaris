import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ConstellationNodeProps {
  id: string;
  x: number;
  y: number;
  size?: 'small' | 'medium' | 'large';
  color?: 'tech' | 'creative' | 'business' | 'science' | 'health';
  active?: boolean;
  pulsing?: boolean;
  onClick?: (id: string) => void;
  label?: string;
}

export const ConstellationNode = ({
  id,
  x,
  y,
  size = 'medium',
  color = 'tech',
  active = false,
  pulsing = false,
  onClick,
  label
}: ConstellationNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-4 h-4',
    large: 'w-6 h-6'
  };

  const colorClasses = {
    tech: 'bg-constellation-tech shadow-constellation-tech',
    creative: 'bg-constellation-creative shadow-constellation-creative',
    business: 'bg-constellation-business shadow-constellation-business',
    science: 'bg-constellation-science shadow-constellation-science',
    health: 'bg-constellation-health shadow-constellation-health'
  };

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={() => onClick?.(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        'rounded-full transition-all duration-300',
        sizeClasses[size],
        colorClasses[color],
        active && 'ring-2 ring-primary',
        pulsing && 'pulse-star',
        (isHovered || active) && 'scale-150 shadow-lg',
        'shadow-[0_0_10px_currentColor]'
      )} />
      
      {(isHovered || active) && label && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg text-sm font-medium whitespace-nowrap z-10">
          {label}
        </div>
      )}
    </div>
  );
};