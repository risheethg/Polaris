import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Line, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface CareerData {
  id: string;
  title: string;
  x: number;
  y: number;
  z: number;
  size: 'small' | 'medium' | 'large';
  category: string;
}

interface SceneProps {
  careers: CareerData[];
  recommendedPath: string[];
  onStarClick: (id: string) => void;
  onStarHover: (id: string | null) => void;
  cameraZoom?: number;
}

const categoryColors: { [key: string]: string } = {
  tech: '#60a5fa',       // blue-400
  creative: '#c084fc',   // purple-400
  business: '#4ade80',   // green-400
  science: '#facc15',    // yellow-400
  health: '#f87171',     // red-400
};

const StarMaterial = shaderMaterial(
  {
    uColor: new THREE.Color(1.0, 1.0, 1.0),
    uTime: 0,
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(uColor, 1.0) * intensity;
    }
  `
);

const Star = ({ career, onClick, onHover }: { career: CareerData, onClick: (id: string) => void, onHover: (id: string | null) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const size = career.size === 'large' ? 1.5 : career.size === 'medium' ? 1 : 0.7;
  const color = categoryColors[career.category] || '#ffffff';

  useFrame(({ clock }) => { // Subtle pulsing effect
    if (meshRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 2 + career.x) * 0.1 + 0.9;
      meshRef.current.scale.set(size * pulse, size * pulse, size * pulse);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[career.x, career.y, career.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(career.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(career.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} toneMapped={false} />
    </mesh>
  );
};

const ConstellationPath = ({ careers, path }: { careers: CareerData[], path: string[] }) => {
  const points = useMemo(() => {
    const careerMap = new Map(careers.map(c => [c.id, c]));
    const pathPoints = path
      .map(id => careerMap.get(id))
      .filter((c): c is CareerData => !!c)
      .map(c => new THREE.Vector3(c.x, c.y, c.z));
    return pathPoints;
  }, [careers, path]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color="white"
      lineWidth={1}
    />
  );
};

const RotatingStars = () => {
  const starsRef = useRef<any>();
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.x += 0.00001;
      starsRef.current.rotation.y += 0.000001;
    }
  });

  return (
    <Stars
      ref={starsRef}
      radius={200}      // Increased radius for a larger feel
      depth={100}       // More depth
      count={20000}     // More stars for a denser field
      factor={5}        // Star size factor
      saturation={0.5}    // Add a bit of color
      fade              // Stars fade near the camera
      speed={0.5}       // Twinkling speed
    />
  );
};

export const Scene = ({ careers, recommendedPath, onStarClick, onStarHover, cameraZoom = 1 }: SceneProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 80], fov: 60, zoom: cameraZoom }}
      onPointerMissed={() => onStarHover(null)}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 50]} intensity={1} color="lightblue" />
      
      <RotatingStars />

      {careers.map(career => (
        <Star
          key={career.id}
          career={career}
          onClick={onStarClick}
          onHover={onStarHover}
        />
      ))}

      <ConstellationPath careers={careers} path={recommendedPath} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.5}
        panSpeed={0.5}
        rotateSpeed={0.4}
        minDistance={20}
        maxDistance={200}
      />
    </Canvas>
  );
};

export default Scene;