import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { ConstellationNode } from '@/components/ConstellationNode';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, MapPin, Clock, Loader2, Map as MapIcon, ZoomIn, ZoomOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';

interface CareerData {
  id: string;
  title: string;
  category: 'tech' | 'creative' | 'business' | 'science' | 'health';
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  description: string;
  skills: string[];
  salary: string;
  growth: string;
  timeToEntry: string;
  riasec: { [key: string]: number };
}

interface UserProfile {
  name: string;
  personality: { [key: string]: number };
}

interface RiasecTrait {
  name: string;
  description: string;
}

const careerConstellations: CareerData[] = [
  // Tech & Data Cluster
  { id: 'swe', title: 'Software Engineer', category: 'tech', x: 20, y: 30, size: 'large', description: 'Designs, develops, and maintains software applications.', skills: ['Programming', 'Problem Solving', 'Algorithms'], salary: '$95k - $180k', growth: '+22%', timeToEntry: '6-12 months', riasec: { R: 0.8, I: 0.7, C: 0.6 } },
  { id: 'ds', title: 'Data Scientist', category: 'tech', x: 25, y: 40, size: 'medium', description: 'Extracts insights from data to drive business decisions.', skills: ['Statistics', 'Python/R', 'Machine Learning'], salary: '$100k - $190k', growth: '+35%', timeToEntry: '12-18 months', riasec: { I: 0.9, R: 0.6, C: 0.5 } },
  { id: 'cloud', title: 'Cloud Architect', category: 'tech', x: 15, y: 22, size: 'medium', description: 'Designs and manages cloud computing infrastructure.', skills: ['AWS/Azure/GCP', 'Networking', 'Security'], salary: '$120k - $210k', growth: '+15%', timeToEntry: '18-36 months', riasec: { I: 0.7, C: 0.7, R: 0.6 } },
  { id: 'devops', title: 'DevOps Engineer', category: 'tech', x: 28, y: 25, size: 'medium', description: 'Automates and streamlines software development and operations.', skills: ['CI/CD', 'Docker', 'Kubernetes'], salary: '$105k - $170k', growth: '+20%', timeToEntry: '12-24 months', riasec: { R: 0.8, C: 0.7 } },
  
  // Creative & Design Cluster
  { id: 'ux', title: 'UX Designer', category: 'creative', x: 35, y: 15, size: 'medium', description: 'Designs intuitive and beautiful user experiences.', skills: ['Design Thinking', 'Prototyping', 'User Research'], salary: '$85k - $140k', growth: '+13%', timeToEntry: '6-12 months', riasec: { A: 0.8, I: 0.6, S: 0.5 } },
  { id: 'gd', title: 'Graphic Designer', category: 'creative', x: 70, y: 25, size: 'medium', description: 'Creates visual communications that inspire and inform.', skills: ['Adobe Suite', 'Typography', 'Branding'], salary: '$50k - $85k', growth: '+3%', timeToEntry: '3-6 months', riasec: { A: 0.9, E: 0.4 } },
  { id: 'cw', title: 'Content Writer', category: 'creative', x: 75, y: 35, size: 'small', description: 'Crafts compelling stories and content for diverse audiences.', skills: ['Writing', 'SEO', 'Content Strategy'], salary: '$45k - $75k', growth: '+8%', timeToEntry: '1-3 months', riasec: { A: 0.8, I: 0.5 } },
  { id: 'animator', title: '3D Animator', category: 'creative', x: 65, y: 18, size: 'medium', description: 'Brings characters and worlds to life through animation.', skills: ['Maya/Blender', 'Rigging', 'Motion Graphics'], salary: '$60k - $110k', growth: '+16%', timeToEntry: '12-24 months', riasec: { A: 0.9, R: 0.6 } },
  
  // Business & Management Cluster
  { id: 'pm', title: 'Product Manager', category: 'business', x: 45, y: 60, size: 'large', description: 'Leads product strategy and drives innovation.', skills: ['Strategy', 'Analytics', 'Communication'], salary: '$110k - $200k', growth: '+19%', timeToEntry: '12-24 months', riasec: { E: 0.9, I: 0.7, C: 0.5 } },
  { id: 'ba', title: 'Business Analyst', category: 'business', x: 50, y: 70, size: 'medium', description: 'Analyzes business processes and recommends improvements.', skills: ['Analysis', 'Requirements Gathering', 'SQL'], salary: '$70k - $120k', growth: '+14%', timeToEntry: '6-12 months', riasec: { C: 0.8, I: 0.7, E: 0.5 } },
  { id: 'mktg', title: 'Marketing Manager', category: 'business', x: 60, y: 55, size: 'medium', description: 'Develops and executes marketing campaigns.', skills: ['Digital Marketing', 'Analytics', 'Branding'], salary: '$80k - $140k', growth: '+10%', timeToEntry: '8-16 months', riasec: { E: 0.8, S: 0.6, A: 0.5 } },
  { id: 'hr', title: 'HR Specialist', category: 'business', x: 55, y: 78, size: 'small', description: 'Manages employee relations, recruitment, and benefits.', skills: ['Communication', 'Recruiting', 'Labor Law'], salary: '$60k - $95k', growth: '+7%', timeToEntry: '4-8 months', riasec: { S: 0.8, C: 0.7, E: 0.6 } },
  
  // Science & Research Cluster
  { id: 'res', title: 'Research Scientist', category: 'science', x: 15, y: 70, size: 'medium', description: 'Conducts cutting-edge research to advance knowledge.', skills: ['Research Methods', 'Analysis', 'Writing'], salary: '$85k - $140k', growth: '+8%', timeToEntry: '24-48 months', riasec: { I: 0.9, A: 0.5 } },
  { id: 'bio', title: 'Biotechnologist', category: 'science', x: 20, y: 80, size: 'small', description: 'Applies biology to develop new technologies.', skills: ['Biology', 'Lab Techniques', 'Innovation'], salary: '$75k - $125k', growth: '+7%', timeToEntry: '18-36 months', riasec: { I: 0.8, R: 0.7 } },
  { id: 'env', title: 'Environmental Scientist', category: 'science', x: 10, y: 60, size: 'medium', description: 'Protects the environment and human health.', skills: ['Field Work', 'Data Analysis', 'Policy'], salary: '$60k - $100k', growth: '+8%', timeToEntry: '12-24 months', riasec: { I: 0.8, R: 0.7, S: 0.4 } },
  
  // Health & Wellness Cluster
  { id: 'nurse', title: 'Registered Nurse', category: 'health', x: 85, y: 70, size: 'large', description: 'Provides compassionate care and support to patients.', skills: ['Patient Care', 'Medical Knowledge', 'Empathy'], salary: '$75k - $95k', growth: '+7%', timeToEntry: '24-36 months', riasec: { S: 0.9, R: 0.5 } },
  { id: 'therapist', title: 'Physical Therapist', category: 'health', x: 90, y: 60, size: 'medium', description: 'Helps patients recover and improve physical function.', skills: ['Anatomy', 'Rehabilitation', 'Communication'], salary: '$85k - $105k', growth: '+18%', timeToEntry: '36-48 months', riasec: { S: 0.8, R: 0.6, I: 0.5 } },
  { id: 'nutritionist', title: 'Nutritionist', category: 'health', x: 80, y: 80, size: 'small', description: 'Advises on diet and nutrition for health and wellness.', skills: ['Dietetics', 'Counseling', 'Biology'], salary: '$55k - $80k', growth: '+11%', timeToEntry: '12-24 months', riasec: { S: 0.8, I: 0.7 } },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedCareer, setSelectedCareer] = useState<CareerData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendedPath, setRecommendedPath] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);

  // For 3D perspective effect
  const motionX = useMotionValue(0.5);
  const motionY = useMotionValue(0.5);
  const rotateX = useTransform(motionY, [0, 1], [10, -10]);
  const rotateY = useTransform(motionX, [0, 1], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientWidth, clientHeight } = event.currentTarget;
    const { clientX, clientY } = event;
    motionX.set(clientX / clientWidth);
    motionY.set(clientY / clientHeight);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
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

          // Simple recommendation logic based on top 3 RIASEC scores
          const sortedPersonality = Object.entries(data.personality)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([key]) => key);

          const recommendedCareers = careerConstellations
            .map(career => {
              let score = 0;
              for (const trait in career.riasec) {
                if (data.personality[trait]) {
                  score += data.personality[trait] * career.riasec[trait];
                }
              }
              return { ...career, matchScore: score };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3) // Get top 3 matched careers
            .map(c => c.id);
            
          setRecommendedPath(recommendedCareers);

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
    const career = careerConstellations.find(c => c.id === careerId);
    setSelectedCareer(career || null);
    setIsModalOpen(true);
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
    <div className="h-[calc(100vh-3.5rem)] w-full overflow-hidden flex flex-col items-center justify-center bg-background" onMouseMove={handleMouseMove}>
      <div className="text-center mb-8 absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <h1 className="text-4xl font-heading font-bold mb-2">Your Career Constellation</h1>
        <p className="text-muted-foreground">
          Pan, zoom, and click on any star to explore your opportunities.
        </p>
      </div>

      <motion.div
        drag
        dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
        className="w-[150vw] h-[150vh] relative cursor-grab active:cursor-grabbing"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="w-full h-full"
          style={{ rotateX, rotateY, scale }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Background grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full" style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Career Nodes */}
          {careerConstellations.map((career) => (
            <ConstellationNode
              key={career.id}
              id={career.id}
              x={career.x}
              y={career.y}
              size={career.size}
              color={career.category}
              active={selectedCareer?.id === career.id}
              pulsing={recommendedPath.includes(career.id)}
              onClick={handleCareerClick}
              label={career.title}
            />
          ))}

          {/* Recommended Path Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {recommendedPath.slice(0, -1).map((careerIdStart, index) => {
              const startCareer = careerConstellations.find(c => c.id === careerIdStart);
              const endCareer = careerConstellations.find(c => c.id === recommendedPath[index + 1]);
              if (!startCareer || !endCareer) return null;

              return (
                <line
                  key={`${careerIdStart}-${endCareer.id}`}
                  x1={`${startCareer.x}%`}
                  y1={`${startCareer.y}%`}
                  x2={`${endCareer.x}%`}
                  y2={`${endCareer.y}%`}
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                  className="constellation-line opacity-60"
                />
              );
            })}
          </svg>
        </motion.div>
      </motion.div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <Button size="icon" onClick={() => setScale(s => Math.min(s + 0.1, 2))}>
          <ZoomIn size={20} />
        </Button>
        <Button size="icon" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}>
          <ZoomOut size={20} />
        </Button>
      </div>

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