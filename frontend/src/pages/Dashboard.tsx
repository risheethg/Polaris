import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, MapPin, Clock, Loader2, User, Sparkles, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Scene } from '@/components/Scene';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { aStar, AStarNode } from '@/lib/a-star';
import { apiConfig } from '@/lib/api-config';

interface CareerData {
  id: string;
  title: string;
  category: 'tech' | 'creative' | 'business' | 'science' | 'health';
  x: number;
  y: number;
  z: number;
  size: 'small' | 'medium' | 'large';
  description: string;
  skills?: string[];
  salary?: string;
  growth?: string;
  timeToEntry?: string;
  riasec?: { [key: string]: number };
}

interface UserProfile {
  name: string;
  personality: { [key: string]: number };
}

interface ClusterProfile {
  cluster_label: number;
  riasec_profile: { [key: string]: number };
}

interface RiasecTrait {
  name: string;
  description: string;
}

const riasecDetails: { [key: string]: RiasecTrait } = {
  R: { name: 'Realistic', description: 'Practical, hands-on, and action-oriented "Doers".' },
  I: { name: 'Investigative', description: 'Analytical, curious, and observant "Thinkers".' },
  A: { name: 'Artistic', description: 'Expressive, original, and independent "Creators".' },
  S: { name: 'Social', description: 'Cooperative, supportive, and empathetic "Helpers".' },
  E: { name: 'Enterprising', description: 'Ambitious, sociable, and energetic "Persuaders".' },
  C: { name: 'Conventional', description: 'Precise, methodical, and detail-oriented "Organizers".' },
};

const categoryColors: { [key: string]: string } = {
  tech: 'bg-blue-400',
  creative: 'bg-purple-400',
  business: 'bg-green-400',
  science: 'bg-yellow-400',
  health: 'bg-red-400',
};

const clusterCategoryMapping: { [key: string]: CareerData['category'] } = {
  R: 'health',
  I: 'science',
  A: 'creative',
  S: 'business', // Social can map to business/HR roles
  E: 'business',
  C: 'tech', // Conventional can map to organized tech roles like DevOps/Analysts
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedCareer, setSelectedCareer] = useState<CareerData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [careerConstellations, setCareerConstellations] = useState<CareerData[]>([]);
  const [recommendedPath, setRecommendedPath] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCareer, setHoveredCareer] = useState<CareerData | null>(null);
  const [cameraZoom, setCameraZoom] = useState(1);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch(apiConfig.endpoints.users.me, {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (!response.ok) throw new Error("Failed to fetch user data");
          
          const data = await response.json();
          if (!data.personality) {
            // If no personality data, user hasn't taken assessment. Redirect them.
            navigate('/assessment');
            return;
          }
          setUserProfile(data);

          // Fetch the recommended jobs to draw the constellation path
          const recommendResponse = await fetch(apiConfig.endpoints.ml.recommend, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(data.personality)
          });

          if (recommendResponse.ok) {
            const { recommendations } = await recommendResponse.json();
            // The recommendedPath is an array of career IDs (which are derived from titles)
            const pathIds = recommendations.map((job: { title: string }) => 
              job.title.toLowerCase().replace(/[\s/()]+/g, '-')
            );
            setRecommendedPath(pathIds);
          } else {
            toast.warning("Could not fetch your recommended career path.");
          }

          // Fetch all cluster profiles to categorize jobs
          const clusterProfilesResponse = await fetch(apiConfig.endpoints.ml.clusterProfiles, {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          if (!clusterProfilesResponse.ok) {
            toast.error("Could not fetch career cluster profiles.");
            throw new Error("Failed to fetch cluster profiles");
          }
          const clusterProfiles: ClusterProfile[] = await clusterProfilesResponse.json();

          // Fetch all jobs from the backend.
          const allJobsResponse = await fetch(apiConfig.endpoints.ml.allJobs, {
             headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (!allJobsResponse.ok) {
            toast.error("Could not fetch all jobs.");
            throw new Error("Failed to fetch all jobs");
          }
          const allJobs: { title: string; description: string; cluster_label: number }[] = await allJobsResponse.json();

          const fetchedCareers = allJobs.map((job, index) => {
            const clusterProfile = clusterProfiles.find(p => p.cluster_label === job.cluster_label);
            let category: CareerData['category'] = 'business'; // Default
            if (clusterProfile) {
              // Find the dominant RIASEC trait for the cluster to assign a color/category
              const dominantTrait = Object.keys(clusterProfile.riasec_profile).reduce((a, b) => 
                clusterProfile.riasec_profile[a] > clusterProfile.riasec_profile[b] ? a : b
              );
              category = clusterCategoryMapping[dominantTrait] || 'business';
            }

            // Generate 3D positions for the stars within a spherical volume
            const radius = 15 + Math.random() * 10; // Keep clusters tight
            const phi = Math.acos(2 * Math.random() - 1); // Polar angle (from -1 to 1)
            const theta = Math.random() * 2 * Math.PI; // Azimuthal angle

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            return {
              id: job.title.toLowerCase().replace(/[\s/()]+/g, '-'),
              title: job.title,
              description: job.description,
              category: category,
              x: x,
              y: y,
              z: z,
              size: 'medium' as 'medium',
            };
          });
          setCareerConstellations(fetchedCareers);

        } catch (error) {
          console.error("Dashboard Error:", error);
          navigate('/assessment'); // Redirect on error
        } finally {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  const handleCareerClick = (careerId: string) => {
    // const career = careerConstellations.find(c => c.id === careerId);
    // setSelectedCareer(career || null);
    // setIsModalOpen(true);
    // Navigate to the career map page
    navigate(`/level-assessment/${careerId}`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your career map...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full relative">
      <div className="text-center mb-8 absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <h1 className="text-4xl font-heading font-bold mb-2">Your Career Constellation</h1>
        {userProfile && (
          <p className="text-muted-foreground">
            Welcome, {userProfile.name?.split(' ')[0] || 'Explorer'}! Orbit, zoom, and click on any star to explore your opportunities.
          </p>
        )}
      </div>

      <main className="w-full h-full">
        <Scene 
          careers={careerConstellations} 
          recommendedPath={recommendedPath} 
          onStarClick={handleCareerClick}
          onStarHover={id => setHoveredCareer(careerConstellations.find(c => c.id === id) || null)}
          cameraZoom={cameraZoom}
        />
        <CareerLegend />
        {hoveredCareer && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4 z-20 bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/40 max-w-sm"
          >
            <h4 className="font-heading text-lg">{hoveredCareer.title}</h4>
            <p className="text-sm text-muted-foreground">{hoveredCareer.description}</p>
          </motion.div>
        )}
      </main>

      {/* Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedCareer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-heading">{selectedCareer.title}</DialogTitle>
                <DialogDescription>{selectedCareer.description}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-muted-foreground"><TrendingUp size={16} /> Salary Range</h4>
                    <p className="text-lg font-bold text-secondary">{selectedCareer.salary}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-muted-foreground"><MapPin size={16} /> Job Growth</h4>
                    <p className="text-lg font-bold text-accent">{selectedCareer.growth} <span className="text-sm font-normal text-muted-foreground">(10-year outlook)</span></p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-muted-foreground"><Clock size={16} /> Time to Entry</h4>
                    <p>{selectedCareer.timeToEntry}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.skills.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CareerLegend = () => {
  return (
    <div className="absolute bottom-4 left-4 z-20 bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/40">
      <h4 className="font-heading text-lg mb-3">Career Clusters</h4>
      <div className="space-y-2">
        {Object.entries(clusterCategoryMapping).map(([riasecCode, category]) => (
          <div key={riasecCode} className="flex items-center gap-3">
            <div className={cn('h-3 w-3 rounded-full', categoryColors[category])} />
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">{riasecDetails[riasecCode].name}</span>
              <span className="hidden md:inline">
                {' '}
                - {riasecDetails[riasecCode].description.split(' - ')[1]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};