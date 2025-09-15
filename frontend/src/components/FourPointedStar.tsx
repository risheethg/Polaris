interface FourPointedStarProps {
  size?: number;
  className?: string;
}

export const FourPointedStar = ({ size, className }: FourPointedStarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="-12 -12 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0.5"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" />
  </svg>
);