import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars as DreiStars } from '@react-three/drei';
import { Star } from './Star';

interface CareerData {
  id: string;
  title: string;
  category: 'tech' | 'creative' | 'business' | 'science' | 'health';
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  // ... other properties
}

interface SceneProps {
  careers: CareerData[];
  recommendedPath: string[];
  onStarClick: (id: string) => void;
}

const sizeMap = { small: 0.3, medium: 0.5, large: 0.7 };
const colorMap = {
  tech: '#5DADE2',
  creative: '#AF7AC5',
  business: '#F5B041',
  science: '#48C9B0',
  health: '#EC7063',
};

export const Scene = ({ careers, recommendedPath, onStarClick }: SceneProps) => {
  return (
    <Canvas camera={{ position: [0, 0, 25], fov: 75 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <DreiStars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {careers.map(career => (
        <Star key={career.id} id={career.id} position={[(career.x - 50) / 4, (career.y - 50) / 4, (Math.random() - 0.5) * 10]} size={sizeMap[career.size]} color={colorMap[career.category]} label={career.title} pulsing={recommendedPath.includes(career.id)} onClick={onStarClick} />
      ))}
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
};