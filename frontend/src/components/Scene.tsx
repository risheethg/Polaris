import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars as DreiStars, Line } from '@react-three/drei';
import { Star } from './Star';
import * as THREE from 'three';

interface CareerData {
  id: string;
  title: string;
  category: 'tech' | 'creative' | 'business' | 'science' | 'health';
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  [key: string]: any; // Allow other properties
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
  const pathPoints = recommendedPath.map(id => {
    const career = careers.find(c => c.id === id);
    if (!career) return new THREE.Vector3(0, 0, 0); // Should not happen
    // Ensure this logic matches the position calculation in Star component
    return new THREE.Vector3((career.x - 50) / 4, (career.y - 50) / 4, (career.id.charCodeAt(0) % 10 - 5) * 1.5);
  }).filter(p => p); // Filter out any potential nulls

  return (
    <Canvas camera={{ position: [0, 0, 25], fov: 75 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <DreiStars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {careers.map(career => {
        // Use a deterministic z-position so lines connect properly
        const zPos = (career.id.charCodeAt(0) % 10 - 5) * 1.5;
        return (
          <Star key={career.id} id={career.id} position={[(career.x - 50) / 4, (career.y - 50) / 4, zPos]} size={sizeMap[career.size]} color={colorMap[career.category]} label={career.title} pulsing={recommendedPath.includes(career.id)} onClick={onStarClick} />
        )
      })}
      {pathPoints.length > 1 && (
        <Line 
          points={pathPoints} 
          color="hsl(var(--primary))" 
          lineWidth={1.5} 
          transparent 
          opacity={0.7} />
      )}
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
};