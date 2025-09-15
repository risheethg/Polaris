import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { PolarisLogo } from '@/components/PolarisLogo';
import { ConstellationNode } from '@/components/ConstellationNode';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, TrendingUp, MapPin, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

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
}

const careerConstellations: CareerData[] = [
  // Tech Constellation
  { id: 'swe', title: 'Software Engineer', category: 'tech', x: 20, y: 30, size: 'large', description: 'Build applications and systems that power the digital world', skills: ['Programming', 'Problem Solving', 'Debugging'], salary: '$95k - $180k', growth: '+22%', timeToEntry: '6-12 months' },
  { id: 'ds', title: 'Data Scientist', category: 'tech', x: 25, y: 40, size: 'medium', description: 'Extract insights from data to drive business decisions', skills: ['Statistics', 'Python/R', 'Machine Learning'], salary: '$100k - $190k', growth: '+35%', timeToEntry: '12-18 months' },
  { id: 'ux', title: 'UX Designer', category: 'creative', x: 30, y: 20, size: 'medium', description: 'Design intuitive and beautiful user experiences', skills: ['Design Thinking', 'Prototyping', 'User Research'], salary: '$85k - $140k', growth: '+13%', timeToEntry: '6-12 months' },
  
  // Creative Constellation
  { id: 'gd', title: 'Graphic Designer', category: 'creative', x: 70, y: 25, size: 'medium', description: 'Create visual communications that inspire and inform', skills: ['Adobe Creative Suite', 'Typography', 'Brand Design'], salary: '$50k - $85k', growth: '+3%', timeToEntry: '3-6 months' },
  { id: 'cw', title: 'Content Writer', category: 'creative', x: 75, y: 35, size: 'small', description: 'Craft compelling stories and content for diverse audiences', skills: ['Writing', 'SEO', 'Content Strategy'], salary: '$45k - $75k', growth: '+8%', timeToEntry: '1-3 months' },
  { id: 'vd', title: 'Video Director', category: 'creative', x: 80, y: 45, size: 'medium', description: 'Direct and produce engaging video content', skills: ['Cinematography', 'Editing', 'Storytelling'], salary: '$60k - $120k', growth: '+18%', timeToEntry: '6-12 months' },
  
  // Business Constellation
  { id: 'pm', title: 'Product Manager', category: 'business', x: 45, y: 60, size: 'large', description: 'Lead product strategy and drive innovation', skills: ['Strategy', 'Analytics', 'Communication'], salary: '$110k - $200k', growth: '+19%', timeToEntry: '12-24 months' },
  { id: 'ba', title: 'Business Analyst', category: 'business', x: 50, y: 70, size: 'medium', description: 'Analyze business processes and recommend improvements', skills: ['Analysis', 'Requirements Gathering', 'SQL'], salary: '$70k - $120k', growth: '+14%', timeToEntry: '6-12 months' },
  { id: 'sm', title: 'Sales Manager', category: 'business', x: 55, y: 50, size: 'medium', description: 'Drive revenue growth and manage client relationships', skills: ['Sales', 'Negotiation', 'CRM'], salary: '$80k - $150k', growth: '+7%', timeToEntry: '6-18 months' },
  
  // Science Constellation
  { id: 'res', title: 'Research Scientist', category: 'science', x: 15, y: 70, size: 'medium', description: 'Conduct cutting-edge research to advance human knowledge', skills: ['Research Methods', 'Statistical Analysis', 'Technical Writing'], salary: '$85k - $140k', growth: '+8%', timeToEntry: '24-48 months' },
  { id: 'bio', title: 'Biotechnologist', category: 'science', x: 20, y: 80, size: 'small', description: 'Apply biological principles to develop new technologies', skills: ['Biology', 'Laboratory Techniques', 'Innovation'], salary: '$75k - $125k', growth: '+7%', timeToEntry: '18-36 months' },
  
  // Health Constellation
  { id: 'nurse', title: 'Registered Nurse', category: 'health', x: 85, y: 70, size: 'large', description: 'Provide compassionate care and support to patients', skills: ['Patient Care', 'Medical Knowledge', 'Empathy'], salary: '$75k - $95k', growth: '+7%', timeToEntry: '24-36 months' },
  { id: 'therapist', title: 'Physical Therapist', category: 'health', x: 90, y: 60, size: 'medium', description: 'Help patients recover and improve their physical function', skills: ['Anatomy', 'Rehabilitation', 'Communication'], salary: '$85k - $105k', growth: '+18%', timeToEntry: '36-48 months' },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCareer, setSelectedCareer] = useState<CareerData | null>(null);
  const [recommendedPath, setRecommendedPath] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    primaryCategory: 'tech' | 'creative' | 'business' | 'science' | 'health';
    skills: string[];
  }>({
    name: 'Future Professional',
    primaryCategory: 'tech',
    skills: ['Problem Solving', 'Analytical Thinking', 'Communication']
  });

  useEffect(() => {
    // Simulate AI analysis based on assessment answers
    const answers = location.state?.answers || [];
    
    // Simple logic to determine career path based on most selected category
    const categoryScore = { tech: 0, creative: 0, business: 0, science: 0, health: 0 };
    answers.forEach((answer: number) => {
      const categories = ['tech', 'creative', 'business', 'science', 'health'];
      if (categories[answer]) {
        categoryScore[categories[answer] as keyof typeof categoryScore]++;
      }
    });
    
    const primaryCategory = Object.entries(categoryScore).reduce((a, b) => 
      categoryScore[a[0] as keyof typeof categoryScore] > categoryScore[b[0] as keyof typeof categoryScore] ? a : b
    )[0] as 'tech' | 'creative' | 'business' | 'science' | 'health';
    
    setUserProfile(prev => ({ ...prev, primaryCategory }));
    
    // Set recommended path based on primary category
    const categoryPaths = {
      tech: ['ux', 'swe', 'ds'],
      creative: ['gd', 'ux', 'vd'],
      business: ['ba', 'pm', 'sm'],
      science: ['res', 'bio', 'ds'],
      health: ['therapist', 'nurse', 'res']
    };
    
    setRecommendedPath(categoryPaths[primaryCategory]);
  }, [location.state]);

  const handleCareerClick = (careerId: string) => {
    const career = careerConstellations.find(c => c.id === careerId);
    setSelectedCareer(career || null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <PolarisLogo size="sm" />
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Welcome back, {userProfile.name}</span>
              <Button variant="ghost" onClick={() => navigate('/')} className="text-foreground hover:text-primary">
                <ArrowLeft className="mr-2" size={16} />
                Home
              </Button>
            </div>
          </nav>
        </header>

        <div className="flex-1 flex">
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
    </div>
  );
};