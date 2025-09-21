import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars as DreiStars } from '@react-three/drei';
import * as THREE from 'three';
import { CareerStep3D } from '@/components/CareerStep3D';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { apiConfig } from '@/lib/api-config';

// --- Type Definitions ---
interface CareerMapStep {
  step_number: number;
  title: string;
  type: "EXPERIENCE" | "SPECIALIZATION" | "PIVOT";
  duration: string;
  description: string;
  tasks_to_complete: string[];
  next_steps: CareerMapStep[];
}

interface CareerMapData {
  startJobTitle: string;
  steps: CareerMapStep[];
}

interface CareerMapSceneProps {
  data: CareerMapData;
}

export const CareerMap = () => {
  const { mapId } = useParams();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [careerMapData, setCareerMapData] = useState<CareerMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDebug = new URLSearchParams(location.search).get('debug') === 'true';

  useEffect(() => {
    const loadMapData = async () => {
      if (!user || !mapId) return;

      setLoading(true);
      setError(null);

      try {
        const idToken = await user.getIdToken();
        const response = await fetch(apiConfig.endpoints.careerMap.generate, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ target_job_title: mapId.replace(/-/g, ' ') })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Failed to generate career map.");
        }

        const data = await response.json();
        setCareerMapData(data);
        toast.success("Your personalized career map has been generated!");

      } catch (err: any) {
        console.error("Career Map Generation Error:", err);
        setError(err.message || "An unknown error occurred.");
        toast.error(err.message || "Could not generate your career map.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadMapData();
    }
  }, [mapId, isDebug, user, authLoading]);

  if (loading || authLoading) {
    return <LoadingState />;
  }

  if (!careerMapData) {
    return <ErrorState message={error || `No career map data found for: ${mapId}`} />;
  }

  return <CareerMapScene data={careerMapData} />;
};

const LoadingState = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
    <div className="text-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
      <p className="text-muted-foreground">Generating your personalized career map... this may take a moment.</p>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 text-center p-4">
    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
    <h2 className="text-2xl font-heading text-destructive mb-2">Map Generation Failed</h2>
    <p className="text-muted-foreground max-w-md">{message}</p>
  </div>
);

const CareerMapScene: React.FC<CareerMapSceneProps> = ({ data }) => {
  // Recursive function to render steps and their children
  const renderSteps = (steps: CareerMapStep[], parentPosition: THREE.Vector3, level = 0): { elements: JSX.Element[], width: number } => {
    const elements: JSX.Element[] = [];
    const yOffset = 65; // Vertical spacing between levels
    const xPadding = 30; // Horizontal padding between sibling branches
    const baseCardWidth = 50; // A base width for leaf nodes to ensure they have space
    let totalWidth = 0;
    const childPositions: { x: number, position: THREE.Vector3 }[] = [];

    // First pass: render children and calculate their widths
    const childrenData = steps.map(step => {
      const childResult = renderSteps(step.next_steps, new THREE.Vector3(), level + 1);
      // A node's width is its children's total width, or a base width if it has no children.
      const childWidth = Math.max(baseCardWidth, childResult.width);
      return { step, childElements: childResult.elements, width: childWidth };
    });

    // Calculate total width of this level
    totalWidth = childrenData.reduce((acc, child, index) => acc + child.width + (index > 0 ? xPadding : 0), 0);

    // Second pass: position this level's nodes based on calculated widths
    // Only center the very first level of nodes.
    let currentX = parentPosition.x - totalWidth / 2;

    childrenData.forEach(({ step, childElements, width }) => {
      const x = currentX + width / 2; // Center the node in its allocated space
      const y = parentPosition.y + yOffset; // Move down for the next level
      const z = 0; // Lock to a 2D plane
      const currentPosition = new THREE.Vector3(x, y, z);

      // Add the current step's 3D component
      elements.push(<CareerStep3D key={`${level}-${step.title}`} step={step} position={currentPosition} parentPosition={parentPosition} />);
      
      // Add its children, now correctly positioned relative to this step
      childElements.forEach(child => elements.push(React.cloneElement(child, { ...child.props, key: `${child.key}-cloned`, position: child.props.position.clone().add(currentPosition) })));

      currentX += width + xPadding;
    });
    return { elements, width: totalWidth };
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full relative">
      <div className="text-center mb-8 absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <h1 className="text-4xl font-heading font-bold mb-2">
          Career Constellation: {data.startJobTitle}
        </h1>
        <p className="text-muted-foreground">
          This is one of many potential pathways from your starting point.
        </p>
      </div>
      <Canvas camera={{ position: [0, 0, 60], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <DreiStars
          radius={100} depth={50} count={5000}
          factor={4} saturation={0} fade speed={1}
        />
        <group position={[0, 15, 0]}>
          {renderSteps(data.steps, new THREE.Vector3(0, 0, 0)).elements}
        </group>
        <OrbitControls 
          enablePan={true}
          enableZoom={false}
          enableRotate={false}
          minAzimuthAngle={0} // Lock horizontal panning
          maxAzimuthAngle={0} // Lock horizontal panning
          minPolarAngle={Math.PI / 2} // Lock vertical rotation
          maxPolarAngle={Math.PI / 2} // Lock vertical rotation
          mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.DOLLY, RIGHT: THREE.ROTATE }}
        />
      </Canvas>
    </div>
  );
};