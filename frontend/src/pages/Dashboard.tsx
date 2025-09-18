import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { ConstellationNode } from '@/components/ConstellationNode';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, MapPin, Clock, Loader2, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

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
  // Tech Constellation
  { id: 'swe', title: 'Software Engineer', category: 'tech', x: 20, y: 30, size: 'large', description: 'Build applications and systems that power the digital world', skills: ['Programming', 'Problem Solving', 'Debugging'], salary: '$95k - $180k', growth: '+22%', timeToEntry: '6-12 months', riasec: { R: 0.8, I: 0.7, C: 0.6 } },
  { id: 'ds', title: 'Data Scientist', category: 'tech', x: 25, y: 40, size: 'medium', description: 'Extract insights from data to drive business decisions', skills: ['Statistics', 'Python/R', 'Machine Learning'], salary: '$100k - $190k', growth: '+35%', timeToEntry: '12-18 months', riasec: { I: 0.9, R: 0.6, C: 0.5 } },
  { id: 'ux', title: 'UX Designer', category: 'creative', x: 30, y: 20, size: 'medium', description: 'Design intuitive and beautiful user experiences', skills: ['Design Thinking', 'Prototyping', 'User Research'], salary: '$85k - $140k', growth: '+13%', timeToEntry: '6-12 months', riasec: { A: 0.8, I: 0.6, S: 0.5 } },
  
  // Creative Constellation
  { id: 'gd', title: 'Graphic Designer', category: 'creative', x: 70, y: 25, size: 'medium', description: 'Create visual communications that inspire and inform', skills: ['Adobe Creative Suite', 'Typography', 'Brand Design'], salary: '$50k - $85k', growth: '+3%', timeToEntry: '3-6 months', riasec: { A: 0.9, E: 0.4 } },
  { id: 'cw', title: 'Content Writer', category: 'creative', x: 75, y: 35, size: 'small', description: 'Craft compelling stories and content for diverse audiences', skills: ['Writing', 'SEO', 'Content Strategy'], salary: '$45k - $75k', growth: '+8%', timeToEntry: '1-3 months', riasec: { A: 0.8, I: 0.5 } },
  { id: 'vd', title: 'Video Director', category: 'creative', x: 80, y: 45, size: 'medium', description: 'Direct and produce engaging video content', skills: ['Cinematography', 'Editing', 'Storytelling'], salary: '$60k - $120k', growth: '+18%', timeToEntry: '6-12 months', riasec: { A: 0.7, E: 0.6, R: 0.5 } },
  
  // Business Constellation
  { id: 'pm', title: 'Product Manager', category: 'business', x: 45, y: 60, size: 'large', description: 'Lead product strategy and drive innovation', skills: ['Strategy', 'Analytics', 'Communication'], salary: '$110k - $200k', growth: '+19%', timeToEntry: '12-24 months', riasec: { E: 0.9, I: 0.7, C: 0.5 } },
  { id: 'ba', title: 'Business Analyst', category: 'business', x: 50, y: 70, size: 'medium', description: 'Analyze business processes and recommend improvements', skills: ['Analysis', 'Requirements Gathering', 'SQL'], salary: '$70k - $120k', growth: '+14%', timeToEntry: '6-12 months', riasec: { C: 0.8, I: 0.7, E: 0.5 } },
  { id: 'sm', title: 'Sales Manager', category: 'business', x: 55, y: 50, size: 'medium', description: 'Drive revenue growth and manage client relationships', skills: ['Sales', 'Negotiation', 'CRM'], salary: '$80k - $150k', growth: '+7%', timeToEntry: '6-18 months', riasec: { E: 0.9, S: 0.6 } },
  
  // Science Constellation
  { id: 'res', title: 'Research Scientist', category: 'science', x: 15, y: 70, size: 'medium', description: 'Conduct cutting-edge research to advance human knowledge', skills: ['Research Methods', 'Statistical Analysis', 'Technical Writing'], salary: '$85k - $140k', growth: '+8%', timeToEntry: '24-48 months', riasec: { I: 0.9, A: 0.5 } },
  { id: 'bio', title: 'Biotechnologist', category: 'science', x: 20, y: 80, size: 'small', description: 'Apply biological principles to develop new technologies', skills: ['Biology', 'Laboratory Techniques', 'Innovation'], salary: '$75k - $125k', growth: '+7%', timeToEntry: '18-36 months', riasec: { I: 0.8, R: 0.7 } },
  
  // Health Constellation
  { id: 'nurse', title: 'Registered Nurse', category: 'health', x: 85, y: 70, size: 'large', description: 'Provide compassionate care and support to patients', skills: ['Patient Care', 'Medical Knowledge', 'Empathy'], salary: '$75k - $95k', growth: '+7%', timeToEntry: '24-36 months', riasec: { S: 0.9, R: 0.5 } },
  { id: 'therapist', title: 'Physical Therapist', category: 'health', x: 90, y: 60, size: 'medium', description: 'Help patients recover and improve their physical function', skills: ['Anatomy', 'Rehabilitation', 'Communication'], salary: '$85k - $105k', growth: '+18%', timeToEntry: '36-48 months', riasec: { S: 0.8, R: 0.6, I: 0.5 } },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedCareer, setSelectedCareer] = useState<CareerData | null>(null);
  const [recommendedPath, setRecommendedPath] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col"
    >
      <div className="flex-1 flex p-6">
        <div className="container mx-auto flex">
          {/* Main Constellation View */}
          <div className="flex-1 relative p-6">
            <div className="h-full relative">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-heading font-bold mb-2">Your Career Constellation</h1>
                <p className="text-muted-foreground">
                  Navigate your personalized career map. Click on any star to explore opportunities.
                </p>
              </div>
              
              {/* Constellation Canvas */}
              <div className="relative h-96 bg-gradient-to-br from-card/20 to-transparent rounded-2xl border border-border/50 overflow-hidden">
                {/* Background grid */}
                <div className="absolute inset-0 opacity-10">
                  <div className="h-full w-full" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
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
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="constellation-line opacity-70"
                      />
                    );
                  })}
                </svg>
              </div>
              
              {/* Legend */}
              <div className="mt-6 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-constellation-tech"></div>
                  <span>Technology</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-constellation-creative"></div>
                  <span>Creative</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-constellation-business"></div>
                  <span>Business</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-constellation-science"></div>
                  <span>Science</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-constellation-health"></div>
                  <span>Health</span>
                </div>
              </div>
            </div>
          </div>

          {/* Career Details Sidebar */}
          <div className="w-96 p-6 space-y-6">
            {selectedCareer ? (
              <GlassCard className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-heading font-bold">{selectedCareer.title}</h3>
                    <Badge variant="secondary" className="mt-2 capitalize">
                      {selectedCareer.category}
                    </Badge>
                  </div>
                  <Star className={`text-constellation-${selectedCareer.category}`} size={24} />
                </div>
                
                <p className="text-muted-foreground">{selectedCareer.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp size={16} />
                      Salary Range
                    </h4>
                    <p className="text-lg font-bold text-secondary">{selectedCareer.salary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      Job Growth
                    </h4>
                    <p className="text-accent font-bold">{selectedCareer.growth} (10-year outlook)</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock size={16} />
                      Time to Entry
                    </h4>
                    <p>{selectedCareer.timeToEntry}</p>
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
                
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <MapIcon className="mr-2 h-4 w-4" />
                  Get Roadmap
                </Button>
              </GlassCard>
            ) : (
              <GlassCard className="text-center space-y-4">
                <Star className="mx-auto text-muted-foreground" size={48} />
                <div>
                  <h3 className="text-xl font-heading font-bold">Explore Your Options</h3>
                  <p className="text-muted-foreground mt-2">
                    Click on any star in your constellation to learn more about career opportunities.
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  ✨ Pulsing stars are part of your recommended path
                </div>
              </GlassCard>
            )}
            
            {/* Recommended Path */}
            <GlassCard>
              <h3 className="text-lg font-heading font-bold mb-4">Your Recommended Path</h3>
              <div className="space-y-3">
                {recommendedPath.map((careerId, index) => {
                  const career = careerConstellations.find(c => c.id === careerId);
                  if (!career) return null;
                  
                  return (
                    <div key={careerId} className="flex items-center gap-3">
                      <div className="text-xl font-bold text-muted-foreground">{index + 1}</div>
                      <div 
                        className="flex-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleCareerClick(careerId)}
                      >
                        {career.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </motion.div>  
  );
};