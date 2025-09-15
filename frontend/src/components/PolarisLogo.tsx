import { Sparkles } from 'lucide-react';

interface PolarisLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PolarisLogo = ({ size = 'md', className = '' }: PolarisLogoProps) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  const iconSizes = {
    sm: 24,
    md: 36,
    lg: 48,
    xl: 64
  };

  // Custom 4-pointed star SVG
  const FourPointedStar = ({ size, className }: { size: number; className: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <FourPointedStar 
          size={iconSizes[size]} 
          className="text-white drop-shadow-lg" 
        />
        <div className="absolute inset-0 animate-pulse opacity-30">
          <FourPointedStar 
            size={iconSizes[size]} 
            className="text-white" 
          />
        </div>
      </div>
      <h1 className={`font-heading font-bold tracking-wider ${sizeClasses[size]} text-primary`}>
        POLARIS
      </h1>
    </div>
  );
};