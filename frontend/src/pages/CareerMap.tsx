import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CareerStep } from '@/components/CareerStep';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars as DreiStars } from '@react-three/drei';

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


const dummyData = {
  startJobTitle: "Graduate Software Engineer",
  steps: [
    {
      step_number: 1,
      title: "Graduate Software Engineer",
      type: "EXPERIENCE",
      duration: "1-2 years",
      description: "Build a strong foundation in core programming principles, data structures, and software development lifecycles.",
      tasks_to_complete: [
        "Contribute to 2-3 major features in a production application.",
        "Master at least one primary programming language (e.g., Python, Java, JavaScript).",
        "Understand CI/CD pipelines and version control (Git)."
      ],
      next_steps: [
        {
          step_number: 2,
          title: "Specialization: Backend Developer",
          type: "SPECIALIZATION",
          duration: "2-3 years",
          description: "Focus on server-side logic, databases, and APIs.",
          tasks_to_complete: ["Build scalable REST APIs.", "Master a database technology (e.g., PostgreSQL)."],
          next_steps: []
        },
        {
          step_number: 2,
          title: "Specialization: Frontend Developer",
          type: "SPECIALIZATION",
          duration: "2-3 years",
          description: "Focus on user interfaces and client-side experiences.",
          tasks_to_complete: ["Master a modern framework like React or Vue.", "Build a complex, responsive UI."],
          next_steps: []
        },
        {
          step_number: 2,
          title: "Alternative Path: DevOps Engineer",
          type: "PIVOT",
          duration: "2-3 years",
          description: "Focus on infrastructure, automation, and deployment pipelines.",
          tasks_to_complete: ["Learn cloud platforms like GCP or AWS.", "Master containerization with Docker & Kubernetes."],
          next_steps: []
        }
      ]
    }
  ]
};

export const CareerMap = () => {
  const { mapId } = useParams();
  const location = useLocation();
  const [careerMapData, setCareerMapData] = useState<CareerMapData | null>(null);
  const [loading, setLoading] = useState(true);

  const isDebug = new URLSearchParams(location.search).get('debug') === 'true';

  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      if (isDebug) {
        // In debug mode, use dummy data
        setCareerMapData(dummyData);
      } else {
        // TODO: Fetch real data from your backend using the mapId
        // For now, we'll simulate a fetch with the dummy data
        await new Promise(res => setTimeout(res, 500));
        setCareerMapData(dummyData);
      }
      setLoading(false);
    };

    loadMapData();
  }, [mapId, isDebug]);

  if (loading) {
    return <LoadingState />;
  }

  if (!careerMapData) {
    return <p>No career map data found for ID: {mapId}</p>;
  }

  return <CareerMapScene data={careerMapData} />;
};

const LoadingState = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

const CareerMapScene: React.FC<CareerMapSceneProps> = ({ data }) => {
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
      <Canvas camera={{ position: [0, 15, 30], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <DreiStars
          radius={100} depth={50} count={5000}
          factor={4} saturation={0} fade speed={1}
        />
        <group position={[0, -10, 0]}>
          {data.steps.map((step, index) => (
            <CareerStep key={index} step={step} />
          ))}
        </group>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};