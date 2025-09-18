import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDebug } from '@/context/DebugContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Check, Loader2, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  skillMatch: number; // Cosine similarity score (0 to 1)
  personalityFit: string; // e.g., "Artistic", "Investigative"
}

// Dummy data for development
const dummyJobs: JobRecommendation[] = [
  { id: '1', title: 'Senior Frontend Developer', company: 'Tech Solutions Inc.', skillMatch: 0.92, personalityFit: 'Investigative' },
  { id: '2', title: 'UI/UX Designer', company: 'Creative Minds LLC', skillMatch: 0.88, personalityFit: 'Artistic' },
  { id: '3', title: 'Backend Engineer (Python)', company: 'DataCore', skillMatch: 0.85, personalityFit: 'Realistic' },
  { id: '4', title: 'Product Manager', company: 'Innovate Co.', skillMatch: 0.81, personalityFit: 'Enterprising' },
  { id: '5', title: 'DevOps Specialist', company: 'CloudNine', skillMatch: 0.78, personalityFit: 'Conventional' },
];

const Recommendations: React.FC = () => {
  const location = useLocation();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDebugMode } = useDebug();

  const cluster = location.state?.cluster || 'Unknown Cluster';

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      // TODO: Replace with actual backend API call
      // The backend will perform cosine similarity search within the 'cluster'
      // and return a ranked list of jobs.
      if (isDebugMode) {
        console.log(`[Debug] Using dummy data for cluster: ${cluster}`);
        // Simulate network delay
        setTimeout(() => {
          setRecommendations(dummyJobs);
          setLoading(false);
        }, 1000);
      } else {
        // Real fetch logic will go here.
        // For now, we'll just show a loading state.
        console.log(`[Production] Waiting for backend implementation for cluster: ${cluster}`);
        setRecommendations([]);
        // In a real scenario, you might keep it loading indefinitely or show a message.
        // For this example, we'll just stop loading after a bit.
        setTimeout(() => setLoading(false), 3000);
      }
    };

    fetchRecommendations();
  }, [isDebugMode, cluster]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const SkeletonCard = () => (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-grow space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-7 w-40" />
        </div>
      </div>
    </GlassCard>
  );

  return (
    <motion.div
      key="recommendations-page"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
      className="absolute inset-0 bg-background"
    >
      <div className="min-h-screen w-full flex items-center justify-center overflow-auto p-6">
        <AnimatePresence mode="wait">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-heading font-bold mb-2">
              Top Job Recommendations
              </h1>
              <p className="text-lg text-muted-foreground">
                Based on your skills and personality profile for the <span className="font-semibold text-primary">{cluster}</span> cluster.
              </p>
            </motion.div>

            {loading ? (
              <motion.div key="loading" className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </motion.div>
            ) : recommendations.length > 0 ? (
              <motion.div
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {recommendations.map((job) => (
                  <motion.div key={job.id} variants={itemVariants}>
                    <GlassCard hover className="p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-grow">
                          <h3 className="text-2xl font-heading font-bold text-primary">{job.title}</h3>
                          <p className="text-md text-muted-foreground mt-1">{job.company}</p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                          <Badge variant="secondary" className="flex items-center gap-2 text-md px-3 py-1">
                            <Check size={16} className="text-green-400" />
                            Skill Match: <span className="font-bold">{(job.skillMatch * 100).toFixed(0)}%</span>
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-2 text-md px-3 py-1">
                            <BrainCircuit size={16} className="text-blue-400" />
                            Personality: <span className="font-bold">{job.personalityFit}</span>
                          </Badge>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassCard className="text-center p-8 space-y-4">
                  <Star className="mx-auto text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">No recommendations found. The backend might not be ready yet.</p>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Recommendations;
