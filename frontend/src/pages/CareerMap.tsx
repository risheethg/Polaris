import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CareerStep } from '@/components/CareerStep';

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
  const [careerMapData, setCareerMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isDebug = new URLSearchParams(location.search).get('debug') === 'true';

  useEffect(() => {
    const fetchMapData = async () => {
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

    fetchMapData();
  }, [mapId, isDebug]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-4xl p-8"
    >
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : careerMapData ? (
        <>
          <h1 className="text-4xl font-bold font-heading mb-2">Career Map: {careerMapData.startJobTitle}</h1>
          <p className="text-muted-foreground mb-12">A potential pathway from your starting point.</p>
          <div className="space-y-8">
            {careerMapData.steps.map((step: any, index: number) => (
              <CareerStep key={index} step={step} isFirst={index === 0} />
            ))}
          </div>
        </>
      ) : (
        <p>No career map data found for ID: {mapId}</p>
      )}
    </motion.div>
  );
};